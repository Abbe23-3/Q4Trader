'use client';

import dynamic from 'next/dynamic';
import { buildResearchLayout, researchPlotConfig } from '@/apps/quantlab/frontend/utils/plotConfig';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false
});

type SignalPoint = {
  x: string;
  y: number;
};

type SpreadChartProps = {
  dates: string[];
  spread: number[];
  equilibrium: number[];
  buySignals: SignalPoint[];
  sellSignals: SignalPoint[];
};

export function SpreadChart({
  dates,
  spread,
  equilibrium,
  buySignals,
  sellSignals
}: SpreadChartProps) {
  return (
    <Plot
      className="h-full w-full"
      config={researchPlotConfig}
      data={[
        {
          type: 'scatter',
          mode: 'lines',
          x: dates,
          y: spread,
          line: { color: '#0f4d8a', width: 2.5 },
          name: 'Spread'
        },
        {
          type: 'scatter',
          mode: 'lines',
          x: dates,
          y: equilibrium,
          line: { color: '#b54708', width: 2, dash: 'dash' },
          name: 'OU equilibrium'
        },
        {
          type: 'scatter',
          mode: 'markers',
          x: buySignals.map((point) => point.x),
          y: buySignals.map((point) => point.y),
          marker: { color: '#0f766e', size: 10, symbol: 'triangle-up' },
          name: 'Buy signal'
        },
        {
          type: 'scatter',
          mode: 'markers',
          x: sellSignals.map((point) => point.x),
          y: sellSignals.map((point) => point.y),
          marker: { color: '#b42318', size: 10, symbol: 'triangle-down' },
          name: 'Sell signal'
        }
      ]}
      layout={buildResearchLayout('Spread')}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}
