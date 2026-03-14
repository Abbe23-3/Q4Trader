"""FastAPI routes exposing the QuantLab stochastic simulation engine."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from apps.quantlab.api.schemas import SimulationRequest, SimulationResponse
from apps.quantlab.quant_engine.stochastic_models.geometric_brownian_motion import (
    GeometricBrownianMotion,
)
from apps.quantlab.quant_engine.stochastic_models.merton_jump_diffusion import (
    MertonJumpDiffusion,
)
from apps.quantlab.quant_engine.stochastic_models.ornstein_uhlenbeck import OrnsteinUhlenbeck
from apps.quantlab.quant_engine.types.simulation_types import SimulationConfig


router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
def simulate_paths(request: SimulationRequest) -> SimulationResponse:
    """Run the selected stochastic model and return JSON-safe arrays."""

    config = SimulationConfig(
        number_of_paths=request.paths,
        time_horizon=request.time_horizon,
        time_steps=request.time_steps,
        initial_value=request.initial_value,
        random_seed=request.random_seed,
    )

    try:
        if request.model == "gbm":
            result = GeometricBrownianMotion(
                drift=request.drift,
                volatility=request.volatility,
            ).simulate(config)
        elif request.model == "ou":
            result = OrnsteinUhlenbeck(
                theta=request.theta,
                mean_level=request.mean_level,
                volatility=request.volatility,
            ).simulate(config)
        elif request.model == "jump_diffusion":
            result = MertonJumpDiffusion(
                drift=request.drift,
                volatility=request.volatility,
                jump_intensity=request.jump_intensity,
                jump_mean=request.jump_mean,
                jump_std=request.jump_std,
            ).simulate(config)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model '{request.model}'.")
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return SimulationResponse(
        time_grid=result.time_grid.tolist(),
        paths=result.paths_matrix.tolist(),
    )
