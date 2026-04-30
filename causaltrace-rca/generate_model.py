"""Generate a minimal pre-trained model for the RCA sidecar.

This script initialises the AERCA model with the same parameters the inference
service uses, runs a dummy forward pass to compute normalisation statistics, and
saves the state dict + .npy files into saved_models/.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import numpy as np
import torch

# Ensure the causaltrace-rca root is on the Python path.
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from args import msds_args
from models.aerca import AERCA


SAVE_DIR = ROOT / "saved_models"
NUM_VARS = 10  # must match msds_args default --num_vars
WINDOW_POINTS = 30  # typical window for the RCA feature assembler


def main() -> None:
    SAVE_DIR.mkdir(parents=True, exist_ok=True)

    # Parse the same defaults the inference service uses.
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
    model.save_dir = str(SAVE_DIR)
    model.eval()

    # Run a dummy forward pass to obtain the us (encoder residual) tensor so
    # we can compute realistic normalisation statistics instead of zeros.
    dummy = torch.randn(WINDOW_POINTS, NUM_VARS).to(model.device)
    with torch.no_grad():
        _, _, _, _, _, _, _, us = model._testing_step(dummy, add_u=False)

    us_np = us.cpu().numpy()
    if us_np.shape[0] > model.window_size:
        us_np = us_np[model.window_size:]

    us_mean = np.mean(us_np, axis=0)
    us_std = np.std(us_np, axis=0)
    # Guard against zero std (inference.py does the same).
    us_std = np.where(np.abs(us_std) < 1e-6, 1.0, us_std)

    model_name = model.model_name
    torch.save(model.state_dict(), SAVE_DIR / f"{model_name}.pt")
    np.save(SAVE_DIR / f"{model_name}_us_mean_encoder.npy", us_mean)
    np.save(SAVE_DIR / f"{model_name}_us_std_encoder.npy", us_std)

    print(f"Saved model files to {SAVE_DIR}:")
    print(f"  {model_name}.pt")
    print(f"  {model_name}_us_mean_encoder.npy")
    print(f"  {model_name}_us_std_encoder.npy")


if __name__ == "__main__":
    main()
