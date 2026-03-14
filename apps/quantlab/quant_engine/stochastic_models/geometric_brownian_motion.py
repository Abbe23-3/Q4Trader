"""Geometric Brownian Motion model for asset price simulation."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from apps.quantlab.quant_engine.types.simulation_types import (
    FloatArray,
    SimulationConfig,
    SimulationResult,
)


@dataclass(frozen=True)
class GeometricBrownianMotion:
    r"""Vectorized Geometric Brownian Motion simulator.

    The model follows

        dS_t = \mu S_t dt + \sigma S_t dW_t

    with the exact discretized solution

        S_t = S_0 exp((\mu - 0.5 \sigma^2) t + \sigma W_t).
    """

    drift: float
    volatility: float

    def simulate(self, config: SimulationConfig) -> SimulationResult:
        """Simulate GBM paths using cumulative Brownian shocks."""

        if config.initial_value <= 0:
            raise ValueError("initial_value must be positive for geometric Brownian motion.")
        if self.volatility < 0:
            raise ValueError("volatility must be non-negative.")

        time_grid = np.linspace(0.0, config.time_horizon, config.time_steps, dtype=np.float64)
        rng = np.random.default_rng(config.random_seed)

        normal_shocks = rng.standard_normal(
            size=(config.number_of_paths, config.time_steps - 1),
            dtype=np.float64,
        )
        brownian_increments = np.sqrt(config.dt) * normal_shocks
        brownian_paths = np.concatenate(
            (
                np.zeros((config.number_of_paths, 1), dtype=np.float64),
                np.cumsum(brownian_increments, axis=1),
            ),
            axis=1,
        )

        drift_term = (self.drift - 0.5 * self.volatility**2) * time_grid
        diffusion_term = self.volatility * brownian_paths
        paths_matrix = config.initial_value * np.exp(drift_term[np.newaxis, :] + diffusion_term)

        return SimulationResult(time_grid=time_grid, paths_matrix=paths_matrix)


def simulate_geometric_brownian_motion(
    *,
    number_of_paths: int,
    time_horizon: float,
    time_steps: int,
    initial_value: float,
    drift: float,
    volatility: float,
    random_seed: int | None = None,
) -> tuple[FloatArray, FloatArray]:
    """Convenience wrapper returning the standard `(time_grid, paths_matrix)` tuple."""

    config = SimulationConfig(
        number_of_paths=number_of_paths,
        time_horizon=time_horizon,
        time_steps=time_steps,
        initial_value=initial_value,
        random_seed=random_seed,
    )
    result = GeometricBrownianMotion(drift=drift, volatility=volatility).simulate(config)
    return result.time_grid, result.paths_matrix
