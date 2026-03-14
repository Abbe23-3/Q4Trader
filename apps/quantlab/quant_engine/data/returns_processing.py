"""Return transformation utilities for QuantLab market data research."""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_log_returns(price_series: pd.Series) -> pd.Series:
    """Compute log returns from a price series.

    Log returns are defined as

        r_t = log(P_t / P_{t-1})

    which are additive across time and standard in stochastic model calibration.
    """

    if not isinstance(price_series, pd.Series):
        raise TypeError("price_series must be a pandas Series.")

    cleaned_prices = pd.to_numeric(price_series, errors="coerce").astype(float)
    cleaned_prices = cleaned_prices.where(cleaned_prices > 0).dropna()
    if cleaned_prices.empty:
        return pd.Series(dtype=float, name="log_returns")

    log_prices = np.log(cleaned_prices)
    log_returns = log_prices.diff()
    log_returns = log_returns.replace([np.inf, -np.inf], np.nan).dropna()
    log_returns.name = f"{price_series.name or 'price'}_log_returns"
    return log_returns
