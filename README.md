# Research Platforms

This repository contains one public website with two financial research applications:

- `Q4Trader` for valuation and earnings-driven equity research
- `QuantLab` for quantitative modelling, simulation, strategy research, and regime analysis

The site is implemented with Next.js and is intended to deploy on Vercel. QuantLab also includes a Python backend for stochastic simulation and research APIs.

## Live App Structure

- `/q4trader` runs the new Q4Trader application inside the shared site
- `/quantlab` is the QuantLab platform entry point
- `/quantlab/simulation` runs the stochastic simulation dashboard
- `/quantlab/mean-reversion` runs the statistical arbitrage research dashboard
- `/quantlab/regimes` runs the regime detection dashboard
- `/quantlab/research` documents the mathematical models used in QuantLab

## Project Structure

```text
app/                     Next.js App Router entrypoints
apps/q4trader/           Q4Trader frontend + logic
apps/quantlab/frontend/  QuantLab UI
apps/quantlab/quant_engine/ Quant models and research code
apps/quantlab/api/       FastAPI backend for QuantLab simulation
shared/                  Shared site components
site/                    Homepage and site navigation
```

## Local Development

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Create and install the Python environment

```bash
/opt/homebrew/bin/python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

If `python3` already points to a newer Python on your machine, that is also fine.

### 3. Start the QuantLab backend

```bash
source .venv/bin/activate
uvicorn apps.quantlab.api.main:app --reload --port 8000
```

Or without activating the environment:

```bash
.venv/bin/uvicorn apps.quantlab.api.main:app --reload --port 8000
```

### 4. Start the website

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/q4trader`
- `http://localhost:3000/quantlab`
- `http://localhost:8000/docs`

## Environment Variables

QuantLab simulation uses an environment-based API URL on the frontend.

Create `.env.local` from `.env.example` when needed.

```bash
cp .env.example .env.local
```

Current variable:

- `NEXT_PUBLIC_QUANTLAB_API_BASE_URL`

Local default fallback in code:

- `http://localhost:8000`

## Deploy Strategy

### Frontend

Deploy the Next.js app to Vercel.

Required Vercel environment variable:

```bash
NEXT_PUBLIC_QUANTLAB_API_BASE_URL=https://your-quantlab-api.example.com
```

### Backend

QuantLab's FastAPI backend should be deployed separately from Vercel unless you intentionally restructure it into Vercel Python Functions.

Recommended hosts:

- Railway
- Render
- Fly.io

Backend entrypoint:

```bash
uvicorn apps.quantlab.api.main:app --host 0.0.0.0 --port 8000
```

## Pre-Deploy Checks

Frontend:

```bash
npm run build
```

Python modules:

```bash
PYTHONPYCACHEPREFIX=/tmp/q4trader_pycache .venv/bin/python -m compileall apps/quantlab/api apps/quantlab/quant_engine apps/quantlab/__init__.py apps/__init__.py
```

## Notes

- The new Q4Trader app inside `apps/q4trader` is the version intended to ship with the new website.
- QuantLab can use a local backend now and be switched to a real deployed API later through `NEXT_PUBLIC_QUANTLAB_API_BASE_URL`.
- Real-time APIs can be added later without changing the public route structure; the backend layer is already separated for that purpose.
