from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class DeviceRcaDevice(BaseModel):
    deviceCode: str = Field(..., min_length=1)
    status: str = Field(default="warning")


class DeviceRcaInferenceRequest(BaseModel):
    requestId: str = Field(..., min_length=1)
    profile: str = Field(default="msds_device_stress_v1")
    windowStart: str = Field(..., min_length=1)
    windowEnd: str = Field(..., min_length=1)
    stepMinutes: int = Field(default=1, ge=1)
    devices: List[DeviceRcaDevice] = Field(default_factory=list)
    series: List[List[float]] = Field(default_factory=list)


class DeviceRcaRootCause(BaseModel):
    deviceCode: str
    score: float
    rank: int


class DeviceRcaEdge(BaseModel):
    fromDeviceCode: str
    toDeviceCode: str
    weight: float


class DeviceRcaDebug(BaseModel):
    deviceCount: int
    windowPoints: int
    paddedVariables: int


class DeviceRcaInferenceResponse(BaseModel):
    engine: str = "aerca"
    profile: str
    modelVersion: str
    windowStart: str
    windowEnd: str
    rootCauses: List[DeviceRcaRootCause]
    causalEdges: List[DeviceRcaEdge]
    debug: DeviceRcaDebug


class DeviceRcaHealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    profile: str
    modelVersion: Optional[str] = None
    loadError: Optional[str] = None
