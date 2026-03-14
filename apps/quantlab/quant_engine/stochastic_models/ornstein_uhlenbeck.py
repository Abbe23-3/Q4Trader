"""Ornstein-Uhlenbeck process tools for mean-reverting spread simulation."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from apps.quantlab.quant_engine.types.simulation_types import (
    FloatArray,
    SimulationConfig,
    SimulationResult,
)


@dataclass(frozen=True)
class OrnsteinUhlenbeckParameters:
    """Estimated or user-specified OU parameters."""

    theta: float
    mean_level: float
    volatility: float


@dataclass(frozen=True)
class OrnsteinUhlenbeck:
    r"""Vectorized Ornstein-Uhlenbeck simulator.

    The process follows

        dX_t = \theta (\mu - X_t) dt + \sigma dW_t

    and is commonly used for mean-reverting spreads and residual processes.
    """

    theta: float
    mean_level: float
    volatility: float

    def simulate(self, config: SimulationConfig) -> SimulationResult:
        """Simulate mean-reverting paths with vectorized path updates."""

        if self.theta < 0:
            raise ValueError("theta must be non-negative.")
        if self.volatility < 0:
            raise ValueError("volatility must be non-negative.")

        time_grid = np.linspace(0.0, config.time_horizon, config.time_steps, dtype=np.float64)
        rng = np.random.default_rng(config.random_seed)

        normal_shocks = rng.standard_normal(
            size=(config.number_of_paths, config.time_steps - 1),
            dtype=np.float64,
        )
        paths_matrix = np.empty((config.number_of_paths, config.time_steps), dtype=np.float64)
        paths_matrix[:, 0] = config.initial_value

        decay = np.exp(-self.theta * config.dt)
        conditional_mean_scale = self.mean_level * (1.0 - decay)

        if self.theta == 0:
            innovation_std = self.volatility * np.sqrt(config.dt)
        else:
            innovation_std = self.volatility * np.sqrt((1.0 - np.exp(-2.0 * self.theta * config.dt)) / (2.0 * self.theta))

        for time_index in range(1, config.time_steps):
            paths_matrix[:, time_index] = (
                paths_matrix[:, time_index - 1] * decay
                + conditional_mean_scale
                + innovation_std * normal_shocks[:, time_index - 1]
            )

        return SimulationResult(time_grid=time_grid, paths_matrix=paths_matrix)

    @staticmethod
    def estimate_parameters(observations: FloatArray, dt: float = 1.0) -> OrnsteinUhlenbeckParameters:
        """Estimate OU parameters from a time series using AR(1) regression.

        For the discretized process

            X_{t+1} = a + b X_t + \varepsilon_t

        the continuous-time OU parameters satisfy

            b = exp(-theta * dt)
            a = mean_level * (1 - b).
        """

        series = np.asarray(observations, dtype=np.float64)
        if series.ndim != 1:
            raise ValueError("observations must be a one-dimensional array.")
        if series.size < 3:
            raise ValueError("observations must contain at least three points.")
        if dt <= 0:
            raise ValueError("dt must be positive.")

        x_prev = series[:-1]
        x_next = series[1:]

        design_matrix = np.column_stack((np.ones_like(x_prev), x_prev))
        coefficients, _, _, _ = np.linalg.lstsq(design_matrix, x_next, rcond=None)
        intercept, slope = coefficients

        slope = float(np.clip(slope, 1e-8, 1 - 1e-8))
        theta = -np.log(slope) / dt
        mean_level = intercept / (1.0 - slope)

        residuals = x_next - (intercept + slope * x_prev)
        residual_std = np.std(residuals, ddof=1)
        volatility = residual_std * np.sqrt((2.0 * theta) / (1.0 - slope**2))

        return OrnsteinUhlenbeckParameters(
            theta=float(theta),
            mean_level=float(mean_level),
            volatility=float(volatility),
        )


def simulate_ornstein_uhlenbeck(
    *,
    number_of_paths: int,
    time_horizon: float,
    time_steps: int,
    initial_value: float,
    theta: float,
    mean_level: float,
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
    result = OrnsteinUhlenbeck(
        theta=theta,
        mean_level=mean_level,
        volatility=volatility,
    ).simulate(config)
    return result.time_grid, result.paths_matrix
