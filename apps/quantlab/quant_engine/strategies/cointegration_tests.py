"""Cointegration diagnostics for statistical arbitrage research."""

from __future__ import annotations

import pandas as pd
from statsmodels.tsa.stattools import coint


def test_cointegration(
    series_a: pd.Series,
    series_b: pd.Series,
    significance_level: float = 0.05,
) -> dict[str, object]:
    """Run the Engle-Granger cointegration test on two price series.

    The Engle-Granger framework tests whether a linear combination of two
    non-stationary series is stationary, which is the standard first screen for
    pairs trading and mean-reversion research.
    """

    if not isinstance(series_a, pd.Series) or not isinstance(series_b, pd.Series):
        raise TypeError("series_a and series_b must both be pandas Series.")
    if not 0 < significance_level < 1:
        raise ValueError("significance_level must be between 0 and 1.")

    aligned = pd.concat(
        [
            pd.to_numeric(series_a, errors="coerce"),
            pd.to_numeric(series_b, errors="coerce"),
        ],
        axis=1,
        join="inner",
    ).dropna()

    if aligned.shape[0] < 3:
        raise ValueError("Aligned series must contain at least three valid observations.")

    test_statistic, p_value, critical_values = coint(aligned.iloc[:, 0], aligned.iloc[:, 1])

    return {
        "test_statistic": float(test_statistic),
        "p_value": float(p_value),
        "critical_values": {
            "1%": float(critical_values[0]),
            "5%": float(critical_values[1]),
            "10%": float(critical_values[2]),
        },
        "is_significant": bool(p_value < significance_level),
    }
