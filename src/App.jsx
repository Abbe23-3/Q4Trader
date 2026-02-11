import { useMemo, useRef, useState } from 'react';
import './styles.css';
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
  generateMultipleSensitivity,
  generateAnalystSummary,
  runValuation
} from './valuationEngine';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const initialInputs = {
  sharePrice: 100,
  sharesOutstanding: 100000000,
  netDebt: 2000000000,
  ebitda: 1500000000,
  freeCashFlow: 800000000,
  bullMultiple: 12,
  baseMultiple: 10,
  bearMultiple: 8,
  ebitdaGrowthPct: 0,
  debtPaydownPct: 0
};

const inputConfig = [
  { key: 'sharePrice', label: 'Share Price ($)' },
  { key: 'sharesOutstanding', label: 'Shares Outstanding' },
  { key: 'netDebt', label: 'Net Debt ($)' },
  { key: 'ebitda', label: 'EBITDA ($)' },
  { key: 'freeCashFlow', label: 'Free Cash Flow ($)' },
  { key: 'bullMultiple', label: 'Bull Multiple (x)' },
  { key: 'baseMultiple', label: 'Base Multiple (x)' },
  { key: 'bearMultiple', label: 'Bear Multiple (x)' },
  { key: 'ebitdaGrowthPct', label: 'EBITDA Growth (%)' },
  { key: 'debtPaydownPct', label: 'Debt Paydown (%)' }
];

function App() {
  const [inputs, setInputs] = useState(initialInputs);
  const reportRef = useRef(null);

  const metrics = useMemo(() => runValuation(inputs), [inputs]);
  const sensitivityData = useMemo(
    () =>
      generateMultipleSensitivity(
        metrics.forwardMetrics.forwardEbitda,
        metrics.forwardMetrics.forwardNetDebt,
        inputs.sharesOutstanding,
        5,
        15,
        0.5
      ),
    [metrics.forwardMetrics.forwardEbitda, metrics.forwardMetrics.forwardNetDebt, inputs.sharesOutstanding]
  );
  const analystSummary = useMemo(
    () => generateAnalystSummary(inputs, metrics),
    [inputs, metrics]
  );

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : Number(value)
    }));
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    // Capture the full dashboard at high resolution for print-friendly PDF output.
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f3f2ee'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Report header.
    pdf.setFontSize(14);
    pdf.text('Q4Trader Equity Research Report', margin, 12);

    // Preserve left/right margins and scale content proportionally to A4.
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Reserve vertical space below the title before dashboard content begins.
    const titleHeight = 18;
    let heightLeft = imgHeight;
    let position = titleHeight;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Continue writing remaining content across additional A4 pages.
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + titleHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Date-stamped export filename.
    const today = new Date().toISOString().split('T')[0];
    pdf.save(`Q4Trader_Research_Report_${today}.pdf`);
  };

  return (
    <main className="app-shell">
      <div ref={reportRef}>
        <header>
          <p className="eyebrow">Q4Trader</p>
          <h1>Institutional Equity Valuation Engine</h1>
        </header>

        <section className="panel">
          <h2>Key Inputs</h2>
          <div className="grid inputs-grid">
            {inputConfig.map(({ key, label }) => (
              <label key={key} className="field">
                <span>{label}</span>
                <input
                  type="number"
                  step="any"
                  value={inputs[key]}
                  onChange={(event) => handleInputChange(key, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Core Valuation Metrics</h2>
          <div className="grid metrics-grid">
            <MetricCard label="Market Cap" value={formatCurrency(metrics.marketCap, 0)} />
            <MetricCard label="Enterprise Value" value={formatCurrency(metrics.enterpriseValue, 0)} />
            <MetricCard label="EV / EBITDA" value={formatMultiple(metrics.evToEbitda)} />
            <MetricCard label="FCF Yield" value={formatPercent(metrics.fcfYield)} />
            <MetricCard label="Net Debt / EBITDA" value={formatMultiple(metrics.netDebtToEbitda)} />
            <MetricCard label="Bull Implied Price" value={formatCurrency(metrics.impliedSharePrices.bull)} />
            <MetricCard label="Base Implied Price" value={formatCurrency(metrics.impliedSharePrices.base)} />
            <MetricCard label="Bear Implied Price" value={formatCurrency(metrics.impliedSharePrices.bear)} />
          </div>
        </section>

        <section className="panel">
          <h2>Forward Projection Metrics</h2>
          <div className="grid metrics-grid">
            <MetricCard
              label="Forward EBITDA"
              value={formatCurrency(metrics.forwardMetrics.forwardEbitda, 0)}
            />
            <MetricCard
              label="Forward Net Debt"
              value={formatCurrency(metrics.forwardMetrics.forwardNetDebt, 0)}
            />
            <MetricCard
              label="Forward Bull Implied Price"
              value={formatCurrency(metrics.forwardMetrics.impliedSharePrices.bull)}
            />
            <MetricCard
              label="Forward Base Implied Price"
              value={formatCurrency(metrics.forwardMetrics.impliedSharePrices.base)}
            />
            <MetricCard
              label="Forward Bear Implied Price"
              value={formatCurrency(metrics.forwardMetrics.impliedSharePrices.bear)}
            />
          </div>
        </section>

        <section className="panel">
          <h2>EV/EBITDA Multiple Sensitivity</h2>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart
                data={sensitivityData}
                margin={{ top: 10, right: 24, left: 8, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d9dde6" />
                <XAxis dataKey="multiple" tickFormatter={(value) => `${value}x`} />
                <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `EV/EBITDA: ${label}x`}
                />
                <Line
                  type="monotone"
                  dataKey="impliedSharePrice"
                  stroke="#0f5cab"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel" data-html2canvas-ignore="true">
          <button
            onClick={handleExportPDF}
            style={{
              background: '#0f5cab',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Export Research Report (PDF)
          </button>
        </section>

        <section className="panel">
          <h2>Analyst Summary</h2>
          <p className="summary">{analystSummary}</p>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

export default App;
