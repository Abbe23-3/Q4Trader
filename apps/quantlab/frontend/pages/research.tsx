'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function QuantLabResearchPage() {
  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--ql-bg-accent),transparent_28%),linear-gradient(180deg,#f7fafc_0%,var(--ql-bg)_100%)]">
      <div className="site-shell relative z-10 px-0 py-8 md:py-10">
        <section className="rounded-[2rem] border border-[color:var(--ql-line)] bg-[var(--ql-panel)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5 border-b border-[color:var(--ql-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ql-accent)]">QuantLab Research Documentation</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 md:text-5xl">
                Mathematical foundations behind the QuantLab research platform.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                QuantLab combines stochastic modelling, empirical calibration, strategy research, and regime analysis
                inside a single quantitative research workspace. This page documents the core models used throughout
                the platform.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab">
                Overview
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/simulation">
                Simulation
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/mean-reversion">
                Mean Reversion
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/regimes">
                Regimes
              </Link>
              <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/quantlab/research">
                Research
              </Link>
            </nav>
          </div>

          <div className="mt-6 grid gap-6">
            <ResearchCard
              eyebrow="Section 1"
              title="Geometric Brownian Motion"
              formula={`dS = μS dt + σS dW`}
            >
              <p>
                Geometric Brownian Motion is the standard starting point for asset price modelling because it combines
                directional drift with stochastic diffusion while preserving strictly positive price paths. In
                continuous time, drift captures expected growth and volatility captures uncertainty around that
                expectation.
              </p>
              <p>
                Volatility controls the dispersion of simulated paths. As `σ` rises, the cross-sectional range of
                possible outcomes widens and terminal prices become more dispersed. This makes the model useful for
                scenario analysis, risk framing, and stress testing.
              </p>
              <p>
                Monte Carlo simulation is used because the goal in practice is not only to compute an expected value,
                but to inspect the full distribution of possible outcomes. QuantLab uses repeated path generation to
                show probability bands, path overlays, and terminal distribution intuition.
              </p>
            </ResearchCard>

            <ResearchCard
              eyebrow="Section 2"
              title="Ornstein-Uhlenbeck Process"
              formula={`dX = θ(μ − X)dt + σ dW`}
            >
              <p>
                The Ornstein-Uhlenbeck process is a canonical mean-reverting model. Unlike GBM, the process is pulled
                back toward a long-run equilibrium level `μ`, with mean-reversion speed governed by `θ`. This makes it
                well suited to spreads, residual series, and other stationary relationships.
              </p>
              <p>
                In statistical arbitrage, OU dynamics provide a quantitative framework for pairs trading and spread
                research. If a spread deviates materially from equilibrium, researchers can study whether the deviation
                is likely to normalize and how quickly that reversion tends to occur.
              </p>
              <p>
                Half-life is a practical summary statistic derived from the mean-reversion speed. It measures how long
                it takes, on average, for a deviation from equilibrium to shrink by half. In research terms, it helps
                align holding periods, entry thresholds, and signal interpretation with the observed dynamics of the
                spread.
              </p>
            </ResearchCard>

            <ResearchCard
              eyebrow="Section 3"
              title="Regime Detection With Hidden Markov Models"
              formula={`P(S_t = k | X_1, ..., X_t)`}
            >
              <p>
                Hidden Markov Models treat market regimes as latent states that cannot be observed directly. Instead,
                the model infers them from observable data such as returns and volatility patterns. Each state is
                associated with its own distributional behavior.
              </p>
              <p>
                In QuantLab, HMM-based regime detection is used to identify volatility regimes such as calm markets,
                elevated volatility, and crash-like stress environments. The model estimates both hidden state
                assignments and the probability that each observation belongs to a given regime.
              </p>
              <p>
                This matters because market behavior is not stable through time. Risk premia, volatility clustering,
                and drawdown behavior often change abruptly. A regime model provides a structured way to detect these
                changes and incorporate them into macro research, volatility analysis, and signal interpretation.
              </p>
            </ResearchCard>

            <ResearchCard
              eyebrow="Section 4"
              title="QuantLab Research Architecture"
              formula={`QuantLab → models → calibration → strategy research → dashboards`}
            >
              <p>
                QuantLab is organized as a research platform rather than a single model viewer. The stochastic model
                layer contains reusable mathematical processes. The simulation engine standardizes path generation.
                Market data and calibration modules connect models to empirical observations. Strategy modules support
                statistical arbitrage workflows. Regime detection extends the stack into macro-style market-state
                analysis.
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                <li>`stochastic_models` for GBM, OU, and jump-diffusion dynamics</li>
                <li>`simulation` for Monte Carlo execution and scalable path generation</li>
                <li>`data` for market ingestion, volatility estimation, and OU calibration</li>
                <li>`strategies` for cointegration, spread construction, mean-reversion signals, and evaluation</li>
                <li>`regime_models` for Hidden Markov state detection and volatility regime classification</li>
                <li>Interactive dashboards for simulation, mean reversion, regime analysis, and research documentation</li>
              </ul>
            </ResearchCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function ResearchCard({
  eyebrow,
  title,
  formula,
  children
}: {
  eyebrow: string;
  title: string;
  formula: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h2>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-[color:var(--ql-line)] bg-slate-950 px-4 py-3 text-sm text-slate-100">
        <code>{formula}</code>
      </pre>
      <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ql-muted)] md:text-base">{children}</div>
    </section>
  );
}
