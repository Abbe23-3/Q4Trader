"""FastAPI application entrypoint for the QuantLab backend."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.quantlab.api.simulation_routes import router as simulation_router


app = FastAPI(
    title="QuantLab API",
    version="0.1.0",
    description="Backend service exposing QuantLab stochastic simulation engines.",
)

default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
configured_origins = [
    origin.strip()
    for origin in os.getenv("QUANTLAB_CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*default_origins, *configured_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Return a simple health payload for Render health checks."""

    return {"status": "ok"}


app.include_router(simulation_router)
