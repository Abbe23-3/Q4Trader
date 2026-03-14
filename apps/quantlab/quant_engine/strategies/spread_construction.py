"""Spread construction tools for mean-reversion strategy research."""

from __future__ import annotations

import pandas as pd
import statsmodels.api as sm


def construct_spread(series_a: pd.Series, series_b: pd.Series) -> pd.Series:
    """Estimate a hedge ratio and construct the residual spread.

    The hedge ratio is estimated from the linear model

        series_a = alpha + beta * series_b + eps

    and the research spread is defined as

        spread = series_a - beta * series_b.
    """

    if not isinstance(series_a, pd.Series) or not isinstance(series_b, pd.Series):
        raise TypeError("series_a and series_b must both be pandas Series.")

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

    dependent = aligned.iloc[:, 0]
    independent = aligned.iloc[:, 1]

    regression = sm.OLS(dependent.to_numpy(), sm.add_constant(independent.to_numpy(), has_constant="add")).fit()
    hedge_ratio = float(regression.params[1])

    spread = dependent - hedge_ratio * independent
    spread.name = f"{series_a.name or 'series_a'}_{series_b.name or 'series_b'}_spread"
    spread.attrs["hedge_ratio"] = hedge_ratio
    spread.attrs["intercept"] = float(regression.params[0])
    spread.attrs["r_squared"] = float(regression.rsquared)
    return spread
