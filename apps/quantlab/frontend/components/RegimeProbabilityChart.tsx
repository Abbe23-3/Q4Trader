'use client';

import dynamic from 'next/dynamic';
import { buildResearchLayout, researchPlotConfig } from '@/apps/quantlab/frontend/utils/plotConfig';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false
});

type RegimeProbabilityChartProps = {
  dates: string[];
  probabilities: number[][];
  labels: string[];
};

const palette = ['#0f766e', '#b54708', '#b42318'];

export function RegimeProbabilityChart({
  dates,
  probabilities,
  labels
}: RegimeProbabilityChartProps) {
  return (
    <Plot
      className="h-full w-full"
      config={researchPlotConfig}
      data={labels.map((label, index) => ({
        type: 'scatter',
        mode: 'lines',
        x: dates,
        y: probabilities.map((row) => row[index] ?? 0),
        line: { color: palette[index] ?? '#0f4d8a', width: 2.2 },
        name: label
      }))}
      layout={buildResearchLayout('Probability')}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}
