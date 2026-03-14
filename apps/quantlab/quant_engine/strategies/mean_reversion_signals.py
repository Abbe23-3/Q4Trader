"""Mean-reversion signal generation based on Ornstein-Uhlenbeck calibration."""

from __future__ import annotations

import numpy as np
import pandas as pd

from apps.quantlab.quant_engine.data.ou_calibration import estimate_ou_parameters


def generate_mean_reversion_signals(
    spread_series: pd.Series,
    entry_zscore: float = 1.5,
    exit_zscore: float = 0.5,
    dt: float = 1.0,
) -> dict[str, object]:
    """Generate OU-based entry and exit signals for a spread series.

    The OU equilibrium level is used as the long-run anchor. Deviations from the
    equilibrium are standardized with the stationary OU standard deviation

        sigma_eq = sigma / sqrt(2 * theta)

    and signals are emitted when the spread moves far enough away from equilibrium.
    """

    if not isinstance(spread_series, pd.Series):
        raise TypeError("spread_series must be a pandas Series.")
    if entry_zscore <= 0:
        raise ValueError("entry_zscore must be positive.")
    if exit_zscore < 0:
        raise ValueError("exit_zscore must be non-negative.")
    if exit_zscore >= entry_zscore:
        raise ValueError("exit_zscore must be smaller than entry_zscore.")

    spread = pd.to_numeric(spread_series, errors="coerce").dropna().astype(float)
    if spread.shape[0] < 3:
        raise ValueError("spread_series must contain at least three valid observations.")

    ou_params = estimate_ou_parameters(spread, dt=dt)
    equilibrium_level = float(ou_params["mu"])
    theta = float(ou_params["theta"])
    sigma = float(ou_params["sigma"])

    stationary_std = sigma / np.sqrt(2.0 * theta) if theta > 0 else float(spread.std(ddof=1))
    if not np.isfinite(stationary_std) or stationary_std <= 0:
        stationary_std = float(spread.std(ddof=1))
    if not np.isfinite(stationary_std) or stationary_std <= 0:
        stationary_std = 1.0

    deviation = spread - equilibrium_level
    zscore = deviation / stationary_std

    long_entry = zscore <= -entry_zscore
    short_entry = zscore >= entry_zscore
    exit_signal = zscore.abs() <= exit_zscore

    # Target position is a research signal rather than an execution engine.
    target_position = pd.Series(
        np.select(
            [long_entry.to_numpy(), short_entry.to_numpy(), exit_signal.to_numpy()],
            [1.0, -1.0, 0.0],
            default=np.nan,
        ),
        index=spread.index,
        name="target_position",
    ).ffill().fillna(0.0)

    signals = pd.DataFrame(
        {
            "spread": spread,
            "equilibrium_level": equilibrium_level,
            "deviation": deviation,
            "zscore": zscore,
            "long_entry": long_entry,
            "short_entry": short_entry,
            "exit": exit_signal,
            "target_position": target_position,
        }
    )

    return {
        "signals": signals,
        "ou_parameters": ou_params,
        "equilibrium_level": equilibrium_level,
    }
