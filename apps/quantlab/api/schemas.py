"""Pydantic schemas for QuantLab simulation endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


SimulationModel = Literal["gbm", "ou", "jump_diffusion"]


class SimulationRequest(BaseModel):
    """Request payload for stochastic simulation."""

    model: SimulationModel
    paths: int = Field(..., gt=0, le=100_000)
    time_horizon: float = Field(..., gt=0)
    time_steps: int = Field(..., ge=2, le=5_000)
    initial_value: float = Field(..., gt=0)
    drift: float
    volatility: float = Field(..., ge=0)
    theta: float = Field(5.0, ge=0)
    mean_level: float = 100.0
    jump_intensity: float = Field(0.8, ge=0)
    jump_mean: float = -0.03
    jump_std: float = Field(0.12, ge=0)
    random_seed: int | None = 42


class SimulationResponse(BaseModel):
    """Serialized simulation output."""

    time_grid: list[float]
    paths: list[list[float]]
