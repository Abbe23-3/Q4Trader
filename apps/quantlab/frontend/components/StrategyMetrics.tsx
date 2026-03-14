type StrategyMetricsProps = {
  metrics: {
    cumulativeReturns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    tradeCount: number;
  };
};

export function StrategyMetrics({ metrics }: StrategyMetricsProps) {
  const cards = [
    {
      label: 'Cumulative Returns',
      value: formatSigned(metrics.cumulativeReturns),
      tone: metrics.cumulativeReturns >= 0 ? 'text-teal-700' : 'text-rose-700'
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      tone: 'text-slate-900'
    },
    {
      label: 'Max Drawdown',
      value: formatSigned(metrics.maxDrawdown),
      tone: 'text-amber-700'
    },
    {
      label: 'Trade Count',
      value: metrics.tradeCount.toString(),
      tone: 'text-slate-900'
    }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-[color:var(--ql-line)] bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}

function formatSigned(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}
