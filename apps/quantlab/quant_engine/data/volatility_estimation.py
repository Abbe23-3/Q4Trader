"""Volatility estimation utilities for QuantLab empirical calibration."""

from __future__ import annotations

import numpy as np
import pandas as pd


def estimate_annualized_volatility(
    log_returns: pd.Series,
    window: int = 21,
    trading_days: int = 252,
) -> pd.Series:
    """Estimate rolling annualized volatility from log returns.

    The estimator uses sample rolling standard deviation and annualizes via

        sigma_annual = sigma_daily * sqrt(252).
    """

    if not isinstance(log_returns, pd.Series):
        raise TypeError("log_returns must be a pandas Series.")
    if window < 2:
        raise ValueError("window must be at least 2.")
    if trading_days <= 0:
        raise ValueError("trading_days must be positive.")

    clean_returns = pd.to_numeric(log_returns, errors="coerce").replace([np.inf, -np.inf], np.nan)
    annualized_volatility = clean_returns.rolling(window=window, min_periods=window).std(ddof=1) * np.sqrt(
        trading_days
    )
    annualized_volatility.name = f"{log_returns.name or 'returns'}_annualized_volatility"
    return annualized_volatility
