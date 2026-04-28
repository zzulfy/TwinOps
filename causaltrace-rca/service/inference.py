from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
import torch

from args import msds_args
from models.aerca import AERCA
from service.contracts import (
    DeviceRcaDebug,
    DeviceRcaEdge,
    DeviceRcaHealthResponse,
    DeviceRcaInferenceRequest,
    DeviceRcaInferenceResponse,
    DeviceRcaRootCause,
)


PROFILE = "msds_device_stress_v1"
MODEL_VERSION = "aerca-msds-device-v1"
MAX_DEVICES = 10
MIN_WINDOW_POINTS = 4


@dataclass(frozen=True)
class RuntimeState:
    model: AERCA
    model_name: str
    us_mean_encoder: np.ndarray
    us_std_encoder: np.ndarray


class AercaDeviceRcaEngine:
    def __init__(self, root_dir: Path | None = None):
        self.root_dir = root_dir or Path(__file__).resolve().parents[1]
        self.profile = PROFILE
        self.model_version = MODEL_VERSION
        self.load_error: str | None = None
        self.state: RuntimeState | None = None
        self._load()

    def health(self) -> DeviceRcaHealthResponse:
        return DeviceRcaHealthResponse(
            status="ready" if self.state is not None else "degraded",
            modelLoaded=self.state is not None,
            profile=self.profile,
            modelVersion=self.model_version if self.state is not None else None,
            loadError=self.load_error,
        )

    def infer(self, request: DeviceRcaInferenceRequest) -> DeviceRcaInferenceResponse:
        if self.state is None:
            raise RuntimeError(self.load_error or "RCA model is not loaded")

        device_count = len(request.devices)
        if device_count == 0:
            raise ValueError("devices must not be empty")
        if device_count > MAX_DEVICES:
            raise ValueError(f"device count must be <= {MAX_DEVICES}")
        if request.profile != self.profile:
            raise ValueError(f"unsupported profile: {request.profile}")

        series = np.asarray(request.series, dtype=np.float32)
        if series.ndim != 2:
            raise ValueError("series must be a 2D matrix [time][device]")
        if series.shape[1] != device_count:
            raise ValueError("series device dimension does not match devices length")
        if series.shape[0] < MIN_WINDOW_POINTS:
            raise ValueError(f"series must contain at least {MIN_WINDOW_POINTS} time points")

        padded = np.zeros((series.shape[0], MAX_DEVICES), dtype=np.float32)
        padded[:, :device_count] = np.nan_to_num(series, nan=0.0, posinf=0.0, neginf=0.0)

        model = self.state.model
        model.eval()
        with torch.no_grad():
            _, _, _, encoder_coeffs, _, _, _, us = model._testing_step(padded, add_u=False)

        us_np = us.cpu().numpy()
        if us_np.shape[0] > model.window_size:
            us_np = us_np[model.window_size:]

        std = np.where(np.abs(self.state.us_std_encoder) < 1e-6, 1.0, self.state.us_std_encoder)
        z_score = np.nan_to_num((-(us_np - self.state.us_mean_encoder) / std), nan=0.0, posinf=0.0, neginf=0.0)
        device_scores = self._root_cause_scores(z_score[:, :device_count])
        root_causes = self._build_root_causes(request, device_scores)

        coeff_matrix = torch.max(torch.median(torch.abs(encoder_coeffs), dim=0)[0], dim=0).values.cpu().numpy()
        causal_edges = self._build_edges(request, coeff_matrix[:device_count, :device_count])

        return DeviceRcaInferenceResponse(
            profile=self.profile,
            modelVersion=self.model_version,
            windowStart=request.windowStart,
            windowEnd=request.windowEnd,
            rootCauses=root_causes,
            causalEdges=causal_edges,
            debug=DeviceRcaDebug(
                deviceCount=device_count,
                windowPoints=int(series.shape[0]),
                paddedVariables=MAX_DEVICES,
            ),
        )

    def _load(self) -> None:
        try:
            parser = msds_args.create_arg_parser()
            args = parser.parse_args([])
            options = vars(args)
            options["preprocessing_data"] = 0
            options["training_aerca"] = 0
            options["device"] = "cpu"

            model = AERCA(
                num_vars=options["num_vars"],
                hidden_layer_size=options["hidden_layer_size"],
                num_hidden_layers=options["num_hidden_layers"],
                device=options["device"],
                window_size=options["window_size"],
                stride=options["stride"],
                encoder_gamma=options["encoder_gamma"],
                decoder_gamma=options["decoder_gamma"],
                encoder_lambda=options["encoder_lambda"],
                decoder_lambda=options["decoder_lambda"],
                beta=options["beta"],
                lr=options["lr"],
                epochs=options["epochs"],
                recon_threshold=options["recon_threshold"],
                data_name=options["dataset_name"],
                causal_quantile=options["causal_quantile"],
                root_cause_threshold_encoder=options["root_cause_threshold_encoder"],
                root_cause_threshold_decoder=options["root_cause_threshold_decoder"],
                risk=options["risk"],
                initial_level=options["initial_level"],
                num_candidates=options["num_candidates"],
            )
            save_dir = self.root_dir / "saved_models"
            model.save_dir = str(save_dir)
            model_name = model.model_name
            state_path = save_dir / f"{model_name}.pt"
            if not state_path.exists():
                raise FileNotFoundError(f"missing saved model: {state_path}")

            model.load_state_dict(torch.load(state_path, map_location=model.device))
            us_mean_encoder = np.load(save_dir / f"{model_name}_us_mean_encoder.npy")
            us_std_encoder = np.load(save_dir / f"{model_name}_us_std_encoder.npy")
            self.state = RuntimeState(
                model=model,
                model_name=model_name,
                us_mean_encoder=us_mean_encoder,
                us_std_encoder=us_std_encoder,
            )
            self.load_error = None
        except Exception as exc:
            self.state = None
            self.load_error = str(exc)

    def _root_cause_scores(self, z_score: np.ndarray) -> np.ndarray:
        if z_score.size == 0:
            return np.zeros((0,), dtype=np.float32)
        positive = np.maximum(z_score, 0.0)
        # AERCA evaluation code is top-k oriented. For serving, keep a stable scalar score
        # by taking the upper quantile across the evidence window.
        return np.quantile(positive, 0.9, axis=0)

    def _build_root_causes(
        self,
        request: DeviceRcaInferenceRequest,
        scores: np.ndarray,
    ) -> list[DeviceRcaRootCause]:
        if scores.size == 0:
            return []
        max_score = float(np.max(scores))
        normalized = scores if max_score <= 0 else scores / max_score
        ordering = sorted(
            enumerate(normalized.tolist()),
            key=lambda item: item[1],
            reverse=True,
        )
        result: list[DeviceRcaRootCause] = []
        for rank, (index, score) in enumerate(ordering, start=1):
            result.append(
                DeviceRcaRootCause(
                    deviceCode=request.devices[index].deviceCode,
                    score=round(float(score), 6),
                    rank=rank,
                )
            )
        return result

    def _build_edges(
        self,
        request: DeviceRcaInferenceRequest,
        coeff_matrix: np.ndarray,
    ) -> list[DeviceRcaEdge]:
        edges: list[tuple[int, int, float]] = []
        for source in range(coeff_matrix.shape[0]):
            for target in range(coeff_matrix.shape[1]):
                if source == target:
                    continue
                edges.append((source, target, float(coeff_matrix[source, target])))

        if not edges:
            return []

        max_weight = max(weight for _, _, weight in edges) or 1.0
        normalized_edges = [
            (source, target, weight / max_weight)
            for source, target, weight in edges
            if weight > 0
        ]
        normalized_edges.sort(key=lambda item: item[2], reverse=True)
        selected = list(self._take(normalized_edges, 8))

        return [
            DeviceRcaEdge(
                fromDeviceCode=request.devices[source].deviceCode,
                toDeviceCode=request.devices[target].deviceCode,
                weight=round(weight, 6),
            )
            for source, target, weight in selected
        ]

    def _take(self, values: Iterable[tuple[int, int, float]], limit: int) -> Iterable[tuple[int, int, float]]:
        count = 0
        for value in values:
            if count >= limit:
                break
            yield value
            count += 1
