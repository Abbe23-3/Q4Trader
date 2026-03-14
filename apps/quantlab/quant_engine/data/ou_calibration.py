"""Empirical Ornstein-Uhlenbeck calibration tools for real spread data."""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm


def estimate_ou_parameters(spread_series: pd.Series, dt: float = 1.0) -> dict[str, float]:
    """Estimate Ornstein-Uhlenbeck parameters from a spread series.

    The discrete regression

        X_{t+1} = a + b X_t + eps_t

    is fit with OLS. The continuous-time OU parameters are then recovered through

        theta = -log(b) / dt
        mu = a / (1 - b)

    and sigma is inferred from the residual variance under the exact transition law.
    """

    if not isinstance(spread_series, pd.Series):
        raise TypeError("spread_series must be a pandas Series.")
    if dt <= 0:
        raise ValueError("dt must be positive.")

    clean_series = pd.to_numeric(spread_series, errors="coerce").dropna().astype(float)
    if clean_series.shape[0] < 3:
        raise ValueError("spread_series must contain at least three valid observations.")

    lagged = clean_series.shift(1).dropna()
    current = clean_series.loc[lagged.index]

    design_matrix = sm.add_constant(lagged.to_numpy(), has_constant="add")
    model = sm.OLS(current.to_numpy(), design_matrix)
    fitted = model.fit()

    intercept = float(fitted.params[0])
    slope = float(np.clip(fitted.params[1], 1e-8, 1 - 1e-8))

    theta = -np.log(slope) / dt
    mu = intercept / (1.0 - slope)

    residuals = fitted.resid
    residual_std = float(np.std(residuals, ddof=1))
    sigma = residual_std * np.sqrt((2.0 * theta) / (1.0 - slope**2))
    half_life = np.log(2.0) / theta

    return {
        "theta": float(theta),
        "mu": float(mu),
        "sigma": float(sigma),
        "half_life": float(half_life),
    }
