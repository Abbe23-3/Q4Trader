"""FastAPI application entrypoint for the QuantLab backend."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.quantlab.api.simulation_routes import router as simulation_router


app = FastAPI(
    title="QuantLab API",
    version="0.1.0",
    description="Backend service exposing QuantLab stochastic simulation engines.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router)
