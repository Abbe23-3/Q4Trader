import Link from 'next/link';

export function QuantLabApp() {
  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--ql-bg-accent),transparent_30%),linear-gradient(180deg,#f7fafc_0%,var(--ql-bg)_100%)]">
      <div className="site-shell relative z-10 px-0 py-8 md:py-10">
        <section className="rounded-[2rem] border border-[color:var(--ql-line)] bg-[var(--ql-panel)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ql-accent)]">QuantLab Platform</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 md:text-5xl">
                Professional research workspace for stochastic modeling and statistical arbitrage.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ql-muted)] md:text-base">
                QuantLab now includes a dedicated dashboard surface for stochastic path exploration and mean reversion
                research. The frontend is structured for model visualization, market-data overlays, and strategy review.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  className="rounded-[1.6rem] border border-[color:var(--ql-line)] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                  href="/quantlab/simulation"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">Research Page</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Simulation</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ql-muted)]">
                    Explore GBM, OU, and jump-diffusion path surfaces with interactive Plotly overlays.
                  </p>
                </Link>

                <Link
                  className="rounded-[1.6rem] border border-[color:var(--ql-line)] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                  href="/quantlab/mean-reversion"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">Research Page</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Mean Reversion</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ql-muted)]">
                    Inspect spread behavior, equilibrium anchoring, signals, and strategy metrics in one workspace.
                  </p>
                </Link>

                <Link
                  className="rounded-[1.6rem] border border-[color:var(--ql-line)] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                  href="/quantlab/regimes"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">Research Page</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Regimes</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ql-muted)]">
                    Detect calm, volatile, and crash-style market states with an HMM-style research dashboard.
                  </p>
                </Link>

                <Link
                  className="rounded-[1.6rem] border border-[color:var(--ql-line)] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                  href="/quantlab/research"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ql-accent)]">Research Page</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Research</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ql-muted)]">
                    Read the model documentation behind stochastic simulation, OU mean reversion, and HMM regimes.
                  </p>
                </Link>
              </div>
            </div>

            <aside className="rounded-[1.8rem] border border-[color:var(--ql-line)] bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace Coverage</p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                <li>Interactive Plotly research charts for stochastic simulations and spread analysis.</li>
                <li>Tailwind-powered dashboard surfaces isolated to QuantLab routes.</li>
                <li>Institutional-style metrics panels for path distribution, strategy review, regime analysis, and documentation.</li>
              </ul>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
