"""QuantLab stochastic engine package."""

from .data import (
    compute_log_returns,
    download_price_series,
    estimate_annualized_volatility,
    estimate_ou_parameters,
)
from .regime_models import fit_hmm_regime_model
from .simulation import MonteCarloEngine
from .strategies import (
    construct_spread,
    evaluate_strategy,
    generate_mean_reversion_signals,
    test_cointegration,
)
from .stochastic_models import (
    GeometricBrownianMotion,
    MertonJumpDiffusion,
    OrnsteinUhlenbeck,
    OrnsteinUhlenbeckParameters,
)
from .types import SimulationConfig, SimulationResult

__all__ = [
    "compute_log_returns",
    "download_price_series",
    "estimate_annualized_volatility",
    "estimate_ou_parameters",
    "fit_hmm_regime_model",
    "construct_spread",
    "evaluate_strategy",
    "GeometricBrownianMotion",
    "MertonJumpDiffusion",
    "MonteCarloEngine",
    "OrnsteinUhlenbeck",
    "OrnsteinUhlenbeckParameters",
    "generate_mean_reversion_signals",
    "SimulationConfig",
    "SimulationResult",
    "test_cointegration",
]
