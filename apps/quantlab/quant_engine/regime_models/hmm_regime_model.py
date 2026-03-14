"""Hidden Markov Model regime detection for QuantLab market state research."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from hmmlearn.hmm import GaussianHMM


def fit_hmm_regime_model(price_returns: pd.Series) -> dict[str, list[Any]]:
    """Fit a Gaussian HMM to returns and classify market regimes.

    The routine fits 2-state and 3-state Gaussian HMMs, chooses the specification
    with the better Bayesian Information Criterion, and labels hidden states by
    volatility rank. When three states are detected, the highest-volatility state
    with the most negative mean return is labeled as the crash regime.
    """

    if not isinstance(price_returns, pd.Series):
        raise TypeError("price_returns must be a pandas Series.")

    clean_returns = pd.to_numeric(price_returns, errors="coerce").dropna().astype(float)
    if clean_returns.shape[0] < 50:
        raise ValueError("price_returns must contain at least 50 valid observations.")

    observations = clean_returns.to_numpy().reshape(-1, 1)

    best_model: GaussianHMM | None = None
    best_score = -np.inf
    best_bic = np.inf

    for n_states in (2, 3):
        model = GaussianHMM(
            n_components=n_states,
            covariance_type="diag",
            n_iter=500,
            random_state=42,
        )
        model.fit(observations)
        score = model.score(observations)
        parameter_count = n_states**2 + 2 * n_states - 1
        bic = -2.0 * score + parameter_count * np.log(len(observations))

        if bic < best_bic:
            best_model = model
            best_score = score
            best_bic = bic

    if best_model is None:
        raise RuntimeError("Failed to fit an HMM regime model.")

    hidden_states = best_model.predict(observations)
    regime_probabilities = best_model.predict_proba(observations)
    regime_volatility = np.sqrt(np.squeeze(best_model.covars_))
    regime_means = np.squeeze(best_model.means_)

    state_labels = _label_regimes(regime_volatility, regime_means)
    mapped_labels = [state_labels[state] for state in hidden_states]

    return {
        "regime_states": hidden_states.astype(int).tolist(),
        "regime_probabilities": regime_probabilities.tolist(),
        "regime_volatility": mapped_labels,
    }


def _label_regimes(state_volatility: np.ndarray, state_means: np.ndarray) -> dict[int, str]:
    """Assign descriptive labels to hidden states based on volatility and mean return."""

    order = np.argsort(state_volatility)
    labels: dict[int, str] = {}

    if len(order) == 2:
        labels[int(order[0])] = "low volatility regime"
        labels[int(order[1])] = "high volatility regime"
        return labels

    low_state = int(order[0])
    remaining_states = [int(order[1]), int(order[2])]
    crash_state = min(remaining_states, key=lambda state: state_means[state])
    high_vol_state = remaining_states[0] if remaining_states[1] == crash_state else remaining_states[1]

    labels[low_state] = "low volatility regime"
    labels[high_vol_state] = "high volatility regime"
    labels[crash_state] = "crash regime"
    return labels
