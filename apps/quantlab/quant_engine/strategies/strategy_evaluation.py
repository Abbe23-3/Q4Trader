"""Performance evaluation for QuantLab mean-reversion research strategies."""

from __future__ import annotations

import numpy as np
import pandas as pd


def evaluate_strategy(
    spread_series: pd.Series,
    signals: pd.DataFrame,
    periods_per_year: int = 252,
) -> dict[str, object]:
    """Evaluate a spread-based mean-reversion strategy.

    The PnL proxy uses lagged target position multiplied by spread changes, which
    is the standard linearized return approximation for a delta-neutral spread.
    """

    if not isinstance(spread_series, pd.Series):
        raise TypeError("spread_series must be a pandas Series.")
    if not isinstance(signals, pd.DataFrame):
        raise TypeError("signals must be a pandas DataFrame.")
    if "target_position" not in signals.columns:
        raise ValueError("signals must contain a 'target_position' column.")
    if periods_per_year <= 0:
        raise ValueError("periods_per_year must be positive.")

    spread = pd.to_numeric(spread_series, errors="coerce").dropna().astype(float)
    signal_frame = signals.copy()

    aligned = pd.concat(
        [spread.rename("spread"), signal_frame["target_position"].rename("target_position")],
        axis=1,
        join="inner",
    ).dropna()

    if aligned.empty:
        raise ValueError("No overlapping observations between spread_series and signals.")

    spread_changes = aligned["spread"].diff().fillna(0.0)
    lagged_position = aligned["target_position"].shift(1).fillna(0.0)
    strategy_returns = lagged_position * spread_changes

    cumulative_returns = strategy_returns.cumsum()
    running_peak = cumulative_returns.cummax()
    drawdown = cumulative_returns - running_peak
    max_drawdown = float(drawdown.min())

    returns_std = float(strategy_returns.std(ddof=1))
    sharpe_ratio = 0.0
    if np.isfinite(returns_std) and returns_std > 0:
        sharpe_ratio = float(np.sqrt(periods_per_year) * strategy_returns.mean() / returns_std)

    position_changes = aligned["target_position"].diff().fillna(aligned["target_position"])
    number_of_trades = int((position_changes != 0).sum())

    performance_metrics = {
        "cumulative_returns": float(cumulative_returns.iloc[-1]),
        "sharpe_ratio": sharpe_ratio,
        "max_drawdown": max_drawdown,
        "number_of_trades": number_of_trades,
    }

    enriched_signals = signal_frame.copy()
    enriched_signals["strategy_returns"] = strategy_returns.reindex(enriched_signals.index).fillna(0.0)
    enriched_signals["cumulative_returns"] = cumulative_returns.reindex(enriched_signals.index).ffill().fillna(0.0)

    return {
        "signals": enriched_signals,
        "spread": spread,
        "performance_metrics": performance_metrics,
    }
