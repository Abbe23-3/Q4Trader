"""Shared simulation types for the QuantLab stochastic engine."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import numpy as np
from numpy.typing import NDArray


FloatArray = NDArray[np.float64]


@dataclass(frozen=True)
class SimulationConfig:
    """Core configuration for Monte Carlo path generation.

    Attributes:
        number_of_paths: Number of simulated paths.
        time_horizon: Total simulation horizon in years.
        time_steps: Number of discrete time points in the output grid.
        initial_value: Starting value for each path.
        random_seed: Optional deterministic seed for reproducibility.
    """

    number_of_paths: int
    time_horizon: float
    time_steps: int
    initial_value: float
    random_seed: int | None = None

    @property
    def dt(self) -> float:
        """Length of each time increment."""

        if self.time_steps < 2:
            raise ValueError("time_steps must be at least 2.")
        return self.time_horizon / (self.time_steps - 1)


@dataclass(frozen=True)
class SimulationResult:
    """Container for simulated time points and path values."""

    time_grid: FloatArray
    paths_matrix: FloatArray


class StochasticModel(Protocol):
    """Protocol implemented by stochastic process models."""

    def simulate(self, config: SimulationConfig) -> SimulationResult:
        """Run a vectorized path simulation for the provided config."""
