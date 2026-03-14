'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { SimulationChart } from '@/apps/quantlab/frontend/components/SimulationChart';
import { getQuantLabApiBaseUrl } from '@/apps/quantlab/frontend/utils/apiConfig';

type SimulationModel = 'gbm' | 'ou' | 'jump';
type ApiSimulationModel = 'gbm' | 'ou' | 'jump_diffusion';

type SimulationResponse = {
  time_grid: number[];
  paths: number[][];
};

type SimulationSummary = {
  timeGrid: number[];
  paths: number[][];
  meanPath: number[];
  lowerBand: number[];
  upperBand: number[];
  terminalMean: number;
  terminalP05: number;
  terminalP95: number;
};

export function QuantLabSimulationPage() {
  const apiBaseUrl = getQuantLabApiBaseUrl();
  const [model, setModel] = useState<SimulationModel>('gbm');
  const [numberOfPaths, setNumberOfPaths] = useState(80);
  const [timeHorizon, setTimeHorizon] = useState(1.5);
  const [timeSteps, setTimeSteps] = useState(160);
  const [initialValue, setInitialValue] = useState(100);
  const [drift, setDrift] = useState(0.1);
  const [volatility, setVolatility] = useState(0.24);
  const [theta, setTheta] = useState(5.5);
  const [meanLevel, setMeanLevel] = useState(102);
  const [jumpIntensity, setJumpIntensity] = useState(0.8);
  const [jumpMean, setJumpMean] = useState(-0.03);
  const [jumpStd, setJumpStd] = useState(0.12);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSimulation() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/simulate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: mapModelToApi(model),
            paths: numberOfPaths,
            time_horizon: timeHorizon,
            time_steps: timeSteps,
            initial_value: initialValue,
            drift,
            volatility,
            theta,
            mean_level: meanLevel,
            jump_intensity: jumpIntensity,
            jump_mean: jumpMean,
            jump_std: jumpStd,
            random_seed: 42
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as { detail?: string } | null;
          throw new Error(errorBody?.detail || 'Simulation request failed.');
        }

        const payload = (await response.json()) as SimulationResponse;
        setSimulation(payload);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to reach the QuantLab simulation service.';
        setError(message);
        setSimulation(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSimulation();

    return () => controller.abort();
  }, [
    apiBaseUrl,
    drift,
    initialValue,
    jumpIntensity,
    jumpMean,
    jumpStd,
    meanLevel,
    model,
    numberOfPaths,
    theta,
    timeHorizon,
    timeSteps,
    volatility
  ]);

  const dataset = useMemo<SimulationSummary | null>(() => {
    if (!simulation || simulation.time_grid.length === 0 || simulation.paths.length === 0) {
      return null;
    }

    const terminalValues = simulation.paths.map((path) => path[path.length - 1] ?? 0);

    return {
      timeGrid: simulation.time_grid,
      paths: simulation.paths,
      meanPath: simulation.time_grid.map((_, index) => average(simulation.paths.map((path) => path[index] ?? 0))),
      lowerBand: simulation.time_grid.map((_, index) =>
        percentile(simulation.paths.map((path) => path[index] ?? 0), 0.05)
      ),
      upperBand: simulation.time_grid.map((_, index) =>
        percentile(simulation.paths.map((path) => path[index] ?? 0), 0.95)
      ),
      terminalMean: average(terminalValues),
      terminalP05: percentile(terminalValues, 0.05),
      terminalP95: percentile(terminalValues, 0.95)
    };
  }, [simulation]);

  const statusMessage = useMemo(() => {
    if (isLoading) return `Running simulation on ${apiBaseUrl}...`;
    if (error) return error;
    return `Simulation output is sourced from the Python stochastic engine at ${apiBaseUrl}.`;
  }, [apiBaseUrl, error, isLoading]);

  const statusTone = error ? 'text-[var(--ql-negative)]' : 'text-[var(--ql-muted)]';

  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--ql-bg-accent),transparent_28%),linear-gradient(180deg,#f7fafc_0%,var(--ql-bg)_100%)]">
      <div className="site-shell relative z-10 px-0 py-8 md:py-10">
        <section className="rounded-[2rem] border border-[color:var(--ql-line)] bg-[var(--ql-panel)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-5 border-b border-[color:var(--ql-line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ql-accent)]">QuantLab Research Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 md:text-5xl">
                Stochastic simulation lab for path-level scenario analysis.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                Explore Geometric Brownian Motion, Ornstein-Uhlenbeck mean reversion, and Merton jump diffusion
                using the live QuantLab Python engine through a local FastAPI service.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab">
                Overview
              </Link>
              <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/quantlab/simulation">
                Simulation
              </Link>
              <Link className="rounded-full border border-[color:var(--ql-line)] bg-white px-4 py-2 text-sm text-slate-700" href="/quantlab/mean-reversion">
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Simulation Controls</h2>
                <span className="rounded-full bg-[var(--ql-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">
                  Live API
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <Field label="Model">
                  <select
                    className="w-full rounded-2xl border border-[color:var(--ql-line)] bg-white px-4 py-3 text-sm text-slate-900"
                    value={model}
                    onChange={(event) => setModel(event.target.value as SimulationModel)}
                  >
                    <option value="gbm">Geometric Brownian Motion</option>
                    <option value="ou">Ornstein-Uhlenbeck</option>
                    <option value="jump">Merton Jump Diffusion</option>
                  </select>
                </Field>
                <Field label="Visible Paths">
                  <NumberInput value={numberOfPaths} onChange={setNumberOfPaths} min={20} max={180} step={10} />
                </Field>
                <Field label="Time Horizon (years)">
                  <NumberInput value={timeHorizon} onChange={setTimeHorizon} min={0.5} max={5} step={0.25} />
                </Field>
                <Field label="Time Steps">
                  <NumberInput value={timeSteps} onChange={setTimeSteps} min={40} max={260} step={10} />
                </Field>
                <Field label="Initial Value">
                  <NumberInput value={initialValue} onChange={setInitialValue} min={1} max={500} step={1} />
                </Field>
                <Field label="Drift">
                  <NumberInput value={drift} onChange={setDrift} min={-0.25} max={0.4} step={0.01} />
                </Field>
                <Field label="Volatility">
                  <NumberInput value={volatility} onChange={setVolatility} min={0.01} max={1} step={0.01} />
                </Field>
                {model === 'ou' && (
                  <>
                    <Field label="Mean Reversion Speed">
                      <NumberInput value={theta} onChange={setTheta} min={0.1} max={12} step={0.1} />
                    </Field>
                    <Field label="Long-Run Mean">
                      <NumberInput value={meanLevel} onChange={setMeanLevel} min={0} max={200} step={1} />
                    </Field>
                  </>
                )}
                {model === 'jump' && (
                  <>
                    <Field label="Jump Intensity">
                      <NumberInput value={jumpIntensity} onChange={setJumpIntensity} min={0.1} max={3} step={0.1} />
                    </Field>
                    <Field label="Jump Mean">
                      <NumberInput value={jumpMean} onChange={setJumpMean} min={-0.2} max={0.2} step={0.01} />
                    </Field>
                    <Field label="Jump Std">
                      <NumberInput value={jumpStd} onChange={setJumpStd} min={0.01} max={0.4} step={0.01} />
                    </Field>
                  </>
                )}
              </div>
            </aside>

            <div className="grid gap-6 lg:col-span-2">
              <section className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">Simulated Path Ensemble</h3>
                  <p className={`mt-1 text-sm ${statusTone}`}>{statusMessage}</p>
                </div>
                <div className="w-full h-full overflow-hidden rounded-xl">
                  <div className="h-[360px] w-full md:h-[440px] xl:h-[500px]">
                    {dataset ? (
                      <SimulationChart
                        lowerBand={dataset.lowerBand}
                        meanPath={dataset.meanPath}
                        paths={dataset.paths}
                        timeGrid={dataset.timeGrid}
                        upperBand={dataset.upperBand}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[color:var(--ql-line)] bg-slate-50 px-6 text-center text-sm text-[var(--ql-muted)]">
                        {isLoading
                          ? `Simulation is running on ${apiBaseUrl}/simulate.`
                          : `Set NEXT_PUBLIC_QUANTLAB_API_BASE_URL for deployment, or start the local API on ${apiBaseUrl}.`}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Terminal Mean" value={formatMetric(dataset?.terminalMean)} accent="text-[var(--ql-accent)]" />
                <MetricCard label="5th Percentile" value={formatMetric(dataset?.terminalP05)} accent="text-[var(--ql-negative)]" />
                <MetricCard label="95th Percentile" value={formatMetric(dataset?.terminalP95)} accent="text-[var(--ql-positive)]" />
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function mapModelToApi(model: SimulationModel): ApiSimulationModel {
  if (model === 'jump') return 'jump_diffusion';
  return model;
}

function percentile(values: number[], q: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * q)));
  return sorted[index] ?? 0;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatMetric(value: number | undefined) {
  return typeof value === 'number' ? value.toFixed(2) : '--';
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

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-[-0.05em] ${accent}`}>{value}</p>
    </article>
  );
}
