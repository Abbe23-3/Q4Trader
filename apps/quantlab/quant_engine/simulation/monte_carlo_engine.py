"""Reusable Monte Carlo engine for QuantLab stochastic process simulation."""

from __future__ import annotations

from dataclasses import dataclass

from apps.quantlab.quant_engine.types.simulation_types import (
    FloatArray,
    SimulationConfig,
    SimulationResult,
    StochasticModel,
)


@dataclass(frozen=True)
class MonteCarloEngine:
    """Generic Monte Carlo engine for vectorized stochastic models.

    The engine is intentionally lightweight: model-specific mathematics stay in the
    stochastic model modules, while the engine standardizes configuration and output.
    """

    model: StochasticModel

    def simulate(
        self,
        *,
        number_of_paths: int,
        time_horizon: float,
        time_steps: int,
        initial_value: float,
        random_seed: int | None = None,
    ) -> tuple[FloatArray, FloatArray]:
        """Run the model and return `(time_grid, paths_matrix)`."""

        config = SimulationConfig(
            number_of_paths=number_of_paths,
            time_horizon=time_horizon,
            time_steps=time_steps,
            initial_value=initial_value,
            random_seed=random_seed,
        )
        result = self.model.simulate(config)
        return result.time_grid, result.paths_matrix

    def run(self, config: SimulationConfig) -> SimulationResult:
        """Run the model and return the typed result object."""

        return self.model.simulate(config)
