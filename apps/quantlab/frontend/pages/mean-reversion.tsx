'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { SpreadChart } from '@/apps/quantlab/frontend/components/SpreadChart';
import { StrategyMetrics } from '@/apps/quantlab/frontend/components/StrategyMetrics';
import { generateMeanReversionDataset } from '@/apps/quantlab/frontend/utils/researchData';

export function QuantLabMeanReversionPage() {
  const [entryZScore, setEntryZScore] = useState(1.5);
  const [exitZScore, setExitZScore] = useState(0.4);
  const [hedgeRatio, setHedgeRatio] = useState(1.12);

  const dataset = useMemo(
    () =>
      generateMeanReversionDataset({
        entryZScore,
        exitZScore,
        hedgeRatio,
        observations: 180,
        seed: 17
      }),
    [entryZScore, exitZScore, hedgeRatio]
  );

  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--ql-bg-accent),transparent_28%),linear-gradient(180deg,#f7fafc_0%,var(--ql-bg)_100%)]">
      <div className="site-shell relative z-10 px-0 py-8 md:py-10">
        <section className="rounded-[2rem] border border-[color:var(--ql-line)] bg-[var(--ql-panel)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5 border-b border-[color:var(--ql-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ql-accent)]">QuantLab Research Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 md:text-5xl">
                Mean reversion research for OU-driven statistical arbitrage.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                Inspect spread behavior, equilibrium anchoring, and entry or exit locations through a clean research
                workspace designed for pair-trading exploration.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab">
                Overview
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/simulation">
                Simulation
              </Link>
              <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/quantlab/mean-reversion">
                Mean Reversion
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/regimes">
                Regimes
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/research">
                Research
              </Link>
            </nav>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Calibration Inputs</h2>
              <div className="mt-5 space-y-4">
                <Field label="Entry Z-Score">
                  <NumberInput value={entryZScore} onChange={setEntryZScore} min={1} max={3} step={0.1} />
                </Field>
                <Field label="Exit Z-Score">
                  <NumberInput value={exitZScore} onChange={setExitZScore} min={0.1} max={1.5} step={0.1} />
                </Field>
                <Field label="Hedge Ratio">
                  <NumberInput value={hedgeRatio} onChange={setHedgeRatio} min={0.6} max={1.8} step={0.01} />
                </Field>
              </div>

              <div className="mt-6 rounded-[1.35rem] border border-[color:var(--ql-line)] bg-slate-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">OU Calibration Snapshot</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-400">Theta</dt>
                    <dd>{dataset.calibration.theta.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-400">Mu</dt>
                    <dd>{dataset.calibration.mu.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-400">Sigma</dt>
                    <dd>{dataset.calibration.sigma.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-400">Half-Life</dt>
                    <dd>{dataset.calibration.halfLife.toFixed(2)}y</dd>
                  </div>
                </dl>
              </div>
            </aside>

            <div className="grid gap-6 lg:col-span-2">
              <section className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">Spread And Signal Map</h3>
                  <p className="mt-1 text-sm text-[var(--ql-muted)]">
                    Spread trajectory, OU equilibrium, and entry markers for mean-reversion research.
                  </p>
                </div>
                <div className="w-full h-full overflow-hidden rounded-xl">
                  <div className="h-[360px] w-full md:h-[440px] xl:h-[500px]">
                    <SpreadChart
                      buySignals={dataset.buySignals}
                      dates={dataset.dates}
                      equilibrium={dataset.equilibrium}
                      sellSignals={dataset.sellSignals}
                      spread={dataset.spread}
                    />
                  </div>
                </div>
              </section>

              <StrategyMetrics metrics={dataset.metrics} />

              <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <article className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Signal Ledger</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">Recent mean reversion events</h2>
                    </div>
                    <span className="rounded-full bg-[var(--ql-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">
                      Research view
                    </span>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                          <th className="pb-2 pr-4">Date</th>
                          <th className="pb-2 pr-4">Action</th>
                          <th className="pb-2 pr-4">Spread</th>
                          <th className="pb-2">Z-Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataset.signals.slice(-8).reverse().map((signal) => (
                          <tr key={`${signal.date}-${signal.action}`} className="rounded-2xl bg-white">
                            <td className="rounded-l-2xl px-4 py-3 text-slate-600">{signal.date}</td>
                            <td className="px-4 py-3 font-medium text-slate-950">{signal.action}</td>
                            <td className="px-4 py-3 text-slate-600">{signal.spread.toFixed(3)}</td>
                            <td className="rounded-r-2xl px-4 py-3 text-slate-600">{signal.zScore.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pair Snapshot</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">Synthetic research pair</h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <PairRow label="Asset A Last" value={dataset.assetA.at(-1)?.toFixed(2) ?? '-'} />
                    <PairRow label="Asset B Last" value={dataset.assetB.at(-1)?.toFixed(2) ?? '-'} />
                    <PairRow label="Spread Last" value={dataset.spread.at(-1)?.toFixed(3) ?? '-'} />
                    <PairRow label="Equilibrium" value={dataset.calibration.mu.toFixed(3)} />
                  </dl>
                </article>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <input
      className="w-full rounded-2xl border border-[color:var(--ql-line)] bg-white px-4 py-3 text-sm text-slate-900"
      max={max}
      min={min}
      step={step}
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function PairRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--ql-line)] bg-white px-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-950">{value}</dd>
    </div>
  );
}
