"""Market data loading utilities for QuantLab empirical research workflows."""

from __future__ import annotations

import pandas as pd
import yfinance as yf


REQUIRED_PRICE_COLUMNS = ["Open", "High", "Low", "Close"]


def download_price_series(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    """Download daily OHLC market data for a ticker.

    The loader standardizes the output for downstream calibration modules:
    - daily interval data from Yahoo Finance
    - timezone-naive DatetimeIndex
    - sorted, de-duplicated rows
    - missing values handled conservatively via forward fill followed by row filtering
    """

    if not ticker:
        raise ValueError("ticker must be provided.")

    data = yf.download(
        tickers=ticker,
        start=start_date,
        end=end_date,
        interval="1d",
        auto_adjust=False,
        progress=False,
    )

    if data.empty:
        raise ValueError(f"No market data returned for ticker '{ticker}'.")

    price_frame = data.copy()

    if isinstance(price_frame.columns, pd.MultiIndex):
        if ticker in price_frame.columns.get_level_values(-1):
            price_frame = price_frame.xs(ticker, axis=1, level=-1)
        else:
            price_frame.columns = price_frame.columns.get_level_values(0)

    price_frame.index = pd.to_datetime(price_frame.index)

    if getattr(price_frame.index, "tz", None) is not None:
        price_frame.index = price_frame.index.tz_localize(None)

    price_frame = price_frame.sort_index()
    price_frame = price_frame[~price_frame.index.duplicated(keep="last")]

    missing_columns = [column for column in REQUIRED_PRICE_COLUMNS if column not in price_frame.columns]
    if missing_columns:
        raise ValueError(f"Missing required OHLC columns: {missing_columns}.")

    price_frame[REQUIRED_PRICE_COLUMNS] = price_frame[REQUIRED_PRICE_COLUMNS].ffill()
    price_frame = price_frame.dropna(subset=["Close"])

    return price_frame
