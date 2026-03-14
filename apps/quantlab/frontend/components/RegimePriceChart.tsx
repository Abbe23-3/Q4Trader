'use client';

import dynamic from 'next/dynamic';
import { buildResearchLayout, researchPlotConfig } from '@/apps/quantlab/frontend/utils/plotConfig';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false
});

type RegimePriceChartProps = {
  dates: string[];
  prices: number[];
  regimeLabels: string[];
};

const regimeColors: Record<string, string> = {
  'low volatility regime': '#0f766e',
  'high volatility regime': '#b54708',
  'crash regime': '#b42318'
};

export function RegimePriceChart({ dates, prices, regimeLabels }: RegimePriceChartProps) {
  return (
    <Plot
      className="h-full w-full"
      config={researchPlotConfig}
      data={[
        {
          type: 'scatter',
          mode: 'lines',
          x: dates,
          y: prices,
          line: { color: '#0f172a', width: 2.2 },
          name: 'Price'
        },
        {
          type: 'scatter',
          mode: 'markers',
          x: dates,
          y: prices,
          marker: {
            color: regimeLabels.map((label) => regimeColors[label] ?? '#0f4d8a'),
            size: 7
          },
          text: regimeLabels,
          hovertemplate: '%{x}<br>Price: %{y:.2f}<br>%{text}<extra></extra>',
          name: 'Regime state'
        }
      ]}
      layout={buildResearchLayout('Price')}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}
