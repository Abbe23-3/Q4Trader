'use client';

import dynamic from 'next/dynamic';
import { buildResearchLayout, researchPlotConfig } from '@/apps/quantlab/frontend/utils/plotConfig';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false
});

type SimulationChartProps = {
  timeGrid: number[];
  paths: number[][];
  meanPath: number[];
  lowerBand: number[];
  upperBand: number[];
};

export function SimulationChart({
  timeGrid,
  paths,
  meanPath,
  lowerBand,
  upperBand
}: SimulationChartProps) {
  const overlayCount = Math.min(paths.length, 28);
  const overlayTraces = paths.slice(0, overlayCount).map((path, index) => ({
    type: 'scattergl',
    mode: 'lines',
    x: timeGrid,
    y: path,
    line: {
      color: 'rgba(15, 77, 138, 0.16)',
      width: index < 3 ? 1.6 : 1
    },
    hoverinfo: 'skip',
    name: `Path ${index + 1}`,
    showlegend: false
  }));

  return (
    <Plot
      className="h-full w-full"
      config={researchPlotConfig}
      data={[
        ...overlayTraces,
        {
          type: 'scatter',
          mode: 'lines',
          x: timeGrid,
          y: upperBand,
          line: { color: 'rgba(15, 118, 110, 0)' },
          hoverinfo: 'skip',
          name: '95% band',
          showlegend: false
        },
        {
          type: 'scatter',
          mode: 'lines',
          x: timeGrid,
          y: lowerBand,
          fill: 'tonexty',
          fillcolor: 'rgba(15, 118, 110, 0.12)',
          line: { color: 'rgba(15, 118, 110, 0)' },
          hoverinfo: 'skip',
          name: '5%-95% band'
        },
        {
          type: 'scatter',
          mode: 'lines',
          x: timeGrid,
          y: meanPath,
          line: { color: '#0f4d8a', width: 3 },
          name: 'Mean path'
        }
      ]}
      layout={buildResearchLayout('Value')}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}
