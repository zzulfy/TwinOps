from __future__ import annotations

from fastapi import FastAPI, HTTPException

from service.contracts import (
    DeviceRcaHealthResponse,
    DeviceRcaInferenceRequest,
    DeviceRcaInferenceResponse,
)
from service.inference import AercaDeviceRcaEngine


app = FastAPI(title="TwinOps RCA Sidecar", version="1.0.0")
engine = AercaDeviceRcaEngine()


@app.get("/health", response_model=DeviceRcaHealthResponse)
def health() -> DeviceRcaHealthResponse:
    return engine.health()


@app.post("/infer/device-rca", response_model=DeviceRcaInferenceResponse)
def infer_device_rca(request: DeviceRcaInferenceRequest) -> DeviceRcaInferenceResponse:
    try:
        return engine.infer(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
