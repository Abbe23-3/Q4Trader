'use client';

import Link from 'next/link';
import { RegimePriceChart } from '@/apps/quantlab/frontend/components/RegimePriceChart';
import { RegimeProbabilityChart } from '@/apps/quantlab/frontend/components/RegimeProbabilityChart';
import { generateRegimeDataset } from '@/apps/quantlab/frontend/utils/researchData';

export function QuantLabRegimesPage() {
  const dataset = generateRegimeDataset();

  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--ql-bg-accent),transparent_28%),linear-gradient(180deg,#f7fafc_0%,var(--ql-bg)_100%)]">
      <div className="site-shell relative z-10 px-0 py-8 md:py-10">
        <section className="rounded-[2rem] border border-[color:var(--ql-line)] bg-[var(--ql-panel)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5 border-b border-[color:var(--ql-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ql-accent)]">QuantLab Research Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 md:text-5xl">
                Hidden Markov regime detection for macro and volatility research.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                Inspect calm, volatile, and crash-style periods through a regime dashboard designed for quantitative
                market-state analysis.
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
              <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/quantlab/regimes">
                Regimes
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/research">
                Research
              </Link>
            </nav>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Regime Snapshot</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ql-muted)]">
                States are labeled by volatility intensity to distinguish calm conditions from stress and crash periods.
              </p>

              <div className="mt-6 space-y-3">
                {dataset.regimeCounts.map((regime) => (
                  <div
                    key={regime.label}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--ql-line)] bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm text-slate-600">{regime.label}</span>
                    <span className="text-sm font-semibold text-slate-950">{regime.count} days</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[color:var(--ql-line)] bg-slate-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current Regime</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                  {dataset.regimeLabels.at(-1) ?? 'low volatility regime'}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  Probability panel on the right shows the confidence assigned to each hidden market state.
                </p>
              </div>
            </aside>

            <div className="grid gap-6 lg:col-span-2">
              <section className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">Price Series With Regime Coloring</h3>
                  <p className="mt-1 text-sm text-[var(--ql-muted)]">
                    Regime-colored observations highlight calm markets, volatility clusters, and crash-style drawdowns.
                  </p>
                </div>
                <div className="w-full h-full overflow-hidden rounded-xl">
                  <div className="h-[360px] w-full md:h-[440px] xl:h-[500px]">
                    <RegimePriceChart
                      dates={dataset.dates}
                      prices={dataset.prices}
                      regimeLabels={dataset.regimeLabels}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">Hidden State Probabilities</h3>
                  <p className="mt-1 text-sm text-[var(--ql-muted)]">
                    Posterior regime probabilities provide a macro-style view of how state conviction changes over time.
                  </p>
                </div>
                <div className="w-full h-full overflow-hidden rounded-xl">
                  <div className="h-[320px] w-full md:h-[380px] xl:h-[420px]">
                    <RegimeProbabilityChart
                      dates={dataset.dates}
                      labels={dataset.uniqueRegimeLabels}
                      probabilities={dataset.regimeProbabilities}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
