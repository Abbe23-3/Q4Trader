export const researchPlotConfig = {
  responsive: true,
  displaylogo: false,
  scrollZoom: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'toggleSpikelines']
};

export function buildResearchLayout(yTitle: string) {
  return {
    autosize: true,
    margin: { l: 40, r: 20, t: 40, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(255,255,255,0.72)',
    hovermode: 'closest',
    xaxis: {
      automargin: true,
      gridcolor: 'rgba(15, 23, 42, 0.08)',
      zeroline: false,
      title: {
        text: 'Time'
      }
    },
    yaxis: {
      automargin: true,
      gridcolor: 'rgba(15, 23, 42, 0.08)',
      zeroline: false,
      title: {
        text: yTitle
      }
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.03,
      xanchor: 'left',
      yanchor: 'bottom'
    },
    font: {
      family: 'IBM Plex Sans, Avenir Next, Segoe UI, sans-serif',
      color: '#0f172a'
    }
  };
}
