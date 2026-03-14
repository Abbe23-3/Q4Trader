"""Merton jump diffusion model for asset paths with discontinuous shocks."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from apps.quantlab.quant_engine.types.simulation_types import (
    FloatArray,
    SimulationConfig,
    SimulationResult,
)


@dataclass(frozen=True)
class MertonJumpDiffusion:
    r"""Vectorized Merton jump-diffusion simulator.

    The model augments GBM with compound Poisson jumps:

        dS_t = \mu S_t dt + \sigma S_t dW_t + J_t

    where jump sizes are lognormal in multiplicative form with

        log(Y) ~ N(jump_mean, jump_std^2).
    """

    drift: float
    volatility: float
    jump_intensity: float
    jump_mean: float
    jump_std: float

    def simulate(self, config: SimulationConfig) -> SimulationResult:
        """Simulate jump-diffusion paths using vectorized Poisson and Gaussian draws."""

        if config.initial_value <= 0:
            raise ValueError("initial_value must be positive for jump-diffusion simulation.")
        if self.volatility < 0:
            raise ValueError("volatility must be non-negative.")
        if self.jump_intensity < 0:
            raise ValueError("jump_intensity must be non-negative.")
        if self.jump_std < 0:
            raise ValueError("jump_std must be non-negative.")

        time_grid = np.linspace(0.0, config.time_horizon, config.time_steps, dtype=np.float64)
        rng = np.random.default_rng(config.random_seed)

        normal_shocks = rng.standard_normal(
            size=(config.number_of_paths, config.time_steps - 1),
            dtype=np.float64,
        )
        poisson_counts = rng.poisson(
            lam=self.jump_intensity * config.dt,
            size=(config.number_of_paths, config.time_steps - 1),
        )
        jump_normals = rng.standard_normal(
            size=(config.number_of_paths, config.time_steps - 1),
            dtype=np.float64,
        )

        # Compensator keeps the process martingale-adjusted in discrete time.
        expected_jump_multiplier = np.exp(self.jump_mean + 0.5 * self.jump_std**2) - 1.0
        drift_term = (
            self.drift - 0.5 * self.volatility**2 - self.jump_intensity * expected_jump_multiplier
        ) * config.dt
        diffusion_term = self.volatility * np.sqrt(config.dt) * normal_shocks

        jump_component = (
            poisson_counts * self.jump_mean
            + np.sqrt(poisson_counts.astype(np.float64)) * self.jump_std * jump_normals
        )

        log_returns = drift_term + diffusion_term + jump_component
        cumulative_log_returns = np.concatenate(
            (
                np.zeros((config.number_of_paths, 1), dtype=np.float64),
                np.cumsum(log_returns, axis=1),
            ),
            axis=1,
        )
        paths_matrix = config.initial_value * np.exp(cumulative_log_returns)

        return SimulationResult(time_grid=time_grid, paths_matrix=paths_matrix)


def simulate_merton_jump_diffusion(
    *,
    number_of_paths: int,
    time_horizon: float,
    time_steps: int,
    initial_value: float,
    drift: float,
    volatility: float,
    jump_intensity: float,
    jump_mean: float,
    jump_std: float,
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
    result = MertonJumpDiffusion(
        drift=drift,
        volatility=volatility,
        jump_intensity=jump_intensity,
        jump_mean=jump_mean,
        jump_std=jump_std,
    ).simulate(config)
    return result.time_grid, result.paths_matrix
