'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
  runValuation,
  type ValuationInputs
} from '@/apps/q4trader/logic/valuationEngine';
import styles from './Q4TraderApp.module.css';

type MultipleProfileKey = 'standard' | 'defensive' | 'growth';

type MultipleProfile = {
  label: string;
  bear: number;
  base: number;
  bull: number;
};

type SourceKey = 'sharePrice' | 'sharesOutstanding' | 'netDebt' | 'ebitda' | 'freeCashFlow';

type Sources = Record<SourceKey, string>;

type SavedCase = {
  id: string;
  savedAt: string;
  companyName: string;
  reportQuarter: string;
  multipleProfile: MultipleProfileKey;
  inputs: ValuationInputs;
  sources: Sources;
  outputs: {
    baseImpliedPrice: number;
    baseUpsideDownside: number;
    forwardBasePrice: number;
    forwardUpsideDownside: number;
    evToEbitda: number;
    fcfYield: number;
    netDebtToEbitda: number;
    quickTake: string;
    sourceCoveragePct: number;
  };
};

const multipleProfiles: Record<MultipleProfileKey, MultipleProfile> = {
  standard: { label: 'Standard', bear: 8, base: 10, bull: 12 },
  defensive: { label: 'Defensive', bear: 7, base: 8.5, bull: 10 },
  growth: { label: 'Growth', bear: 9, base: 11.5, bull: 14 }
};

const initialInputs: ValuationInputs = {
  sharePrice: 100,
  sharesOutstanding: 100000000,
  netDebt: 2000000000,
  ebitda: 1500000000,
  freeCashFlow: 800000000,
  bullMultiple: multipleProfiles.standard.bull,
  baseMultiple: multipleProfiles.standard.base,
  bearMultiple: multipleProfiles.standard.bear,
  ebitdaGrowthPct: 0,
  debtPaydownPct: 0
};

const coreInputConfig: Array<{ key: SourceKey; label: string }> = [
  { key: 'ebitda', label: 'EBITDA ($)' },
  { key: 'netDebt', label: 'Net Debt ($)' },
  { key: 'sharesOutstanding', label: 'Shares Outstanding' },
  { key: 'freeCashFlow', label: 'Free Cash Flow ($)' },
  { key: 'sharePrice', label: 'Share Price ($)' }
];

const initialSources: Sources = coreInputConfig.reduce((acc, field) => {
  acc[field.key] = '';
  return acc;
}, {} as Sources);

const formatSignedPercent = (value: number, digits = 1) => {
  const numeric = Number.isFinite(value) ? value : 0;
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${(numeric * 100).toFixed(digits)}%`;
};

const validateInputs = (inputs: ValuationInputs) => {
  const errors: string[] = [];

  if (inputs.sharesOutstanding <= 0) errors.push('Shares Outstanding måste vara större än 0.');
  if (inputs.ebitda <= 0) errors.push('EBITDA måste vara större än 0.');
  if (inputs.sharePrice <= 0) errors.push('Share Price måste vara större än 0.');
  if ((inputs.debtPaydownPct ?? 0) < 0 || (inputs.debtPaydownPct ?? 0) > 100) {
    errors.push('Debt Paydown måste ligga mellan 0% och 100%.');
  }

  return {
    errors,
    isValid: errors.length === 0
  };
};

const buildQuickTake = (
  metrics: ReturnType<typeof runValuation>,
  inputs: ValuationInputs,
  baseUpside: number
) => {
  const valuationTone =
    baseUpside > 0.15
      ? 'aktien screenar billig i base-case.'
      : baseUpside < -0.15
        ? 'aktien screenar dyr i base-case.'
        : 'aktien screenar nära fair value i base-case.';

  const leverageTone =
    metrics.netDebtToEbitda > 3
      ? 'Leverage är hög och bör vägas in i riskbedömningen.'
      : 'Leverage är hanterbar i nuvarande antaganden.';

  return `Base-case pris: ${formatCurrency(metrics.impliedSharePrices.base)} (${formatSignedPercent(baseUpside)} mot spot ${formatCurrency(inputs.sharePrice)}). ${valuationTone} ${leverageTone}`;
};

const loadSavedCases = (): SavedCase[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem('q4trader_saved_cases');
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function Q4TraderApp() {
  const [inputs, setInputs] = useState<ValuationInputs>(initialInputs);
  const [sources, setSources] = useState<Sources>(initialSources);
  const [companyName, setCompanyName] = useState('');
  const [reportQuarter, setReportQuarter] = useState('');
  const [multipleProfile, setMultipleProfile] = useState<MultipleProfileKey>('standard');
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  useEffect(() => {
    setSavedCases(loadSavedCases());
  }, []);

  const validation = useMemo(() => validateInputs(inputs), [inputs]);
  const metrics = useMemo(() => runValuation(inputs), [inputs]);

  const baseUpsideDownside = useMemo(() => {
    if (!inputs.sharePrice) return 0;
    return (metrics.impliedSharePrices.base - inputs.sharePrice) / inputs.sharePrice;
  }, [inputs.sharePrice, metrics.impliedSharePrices.base]);

  const forwardUpsideDownside = useMemo(() => {
    if (!inputs.sharePrice) return 0;
    return (metrics.forwardMetrics.impliedSharePrices.base - inputs.sharePrice) / inputs.sharePrice;
  }, [inputs.sharePrice, metrics.forwardMetrics.impliedSharePrices.base]);

  const quickTake = useMemo(() => {
    if (!validation.isValid) return 'Korrigera input-felen för att få en tillförlitlig snabbanalys.';
    return buildQuickTake(metrics, inputs, baseUpsideDownside);
  }, [baseUpsideDownside, inputs, metrics, validation.isValid]);

  useEffect(() => {
    window.localStorage.setItem('q4trader_saved_cases', JSON.stringify(savedCases));
  }, [savedCases]);

  const handleInputChange = (field: keyof ValuationInputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : Number(value)
    }));
  };

  const handleSourceChange = (field: SourceKey, value: string) => {
    setSources((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (profile: MultipleProfileKey) => {
    setMultipleProfile(profile);

    const preset = multipleProfiles[profile];
    setInputs((prev) => ({
      ...prev,
      bearMultiple: preset.bear,
      baseMultiple: preset.base,
      bullMultiple: preset.bull
    }));
  };

  const handleSaveCase = () => {
    if (!validation.isValid) return;

    const sourceCoverageCount = coreInputConfig.filter(({ key }) => sources[key].trim()).length;
    const sourceCoveragePct = Math.round((sourceCoverageCount / coreInputConfig.length) * 100);

    const valuationCase: SavedCase = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      companyName: companyName.trim() || 'Unnamed Company',
      reportQuarter: reportQuarter.trim() || 'Quarter not set',
      multipleProfile,
      inputs,
      sources,
      outputs: {
        baseImpliedPrice: metrics.impliedSharePrices.base,
        baseUpsideDownside,
        forwardBasePrice: metrics.forwardMetrics.impliedSharePrices.base,
        forwardUpsideDownside,
        evToEbitda: metrics.evToEbitda,
        fcfYield: metrics.fcfYield,
        netDebtToEbitda: metrics.netDebtToEbitda,
        quickTake,
        sourceCoveragePct
      }
    };

    setSavedCases((prev) => [valuationCase, ...prev].slice(0, 20));
  };

  const handleLoadCase = (valuationCase: SavedCase) => {
    setCompanyName(valuationCase.companyName === 'Unnamed Company' ? '' : valuationCase.companyName);
    setReportQuarter(valuationCase.reportQuarter === 'Quarter not set' ? '' : valuationCase.reportQuarter);
    setMultipleProfile(valuationCase.multipleProfile || 'standard');
    setInputs(valuationCase.inputs);
    setSources({ ...initialSources, ...valuationCase.sources });
  };

  const handleDeleteCase = (id: string) => {
    setSavedCases((prev) => prev.filter((valuationCase) => valuationCase.id !== id));
  };

  return (
    <main className="app-stage">
      <div className="site-shell">
        <header className="app-stage__header">
          <p className="app-stage__eyebrow">Q4Trader Platform</p>
          <h1 className="app-stage__title">Existing workflow preserved inside the new site architecture.</h1>
          <p className="app-stage__copy">
            The valuation module below is the current Q4Trader application, migrated into
            `apps/q4trader` and routed through Next.js.
          </p>
        </header>

        <div className={styles.surface}>
          <div className={styles.appShell}>
            <header className={styles.topHeader}>
              <p className={styles.eyebrow}>Q4Trader</p>
              <h1>Rapportläge: Snabb Värdering</h1>
              <p className={styles.headerCopy}>
                Fokuserat arbetsflöde för att värdera bolag direkt när rapporten släpps.
              </p>
            </header>

            <section className={styles.panel}>
              <div className={styles.panelHeadingRow}>
                <h2>1) Rapportdata</h2>
                <span className={styles.panelMeta}>Nyckeltal + källrad per fält</span>
              </div>

              <div className={`${styles.grid} ${styles.caseMetaGrid}`}>
                <label className={styles.field}>
                  <span>Bolag</span>
                  <input
                    type="text"
                    value={companyName}
                    placeholder="Ex: NIBE"
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Kvartal</span>
                  <input
                    type="text"
                    value={reportQuarter}
                    placeholder="Ex: Q4 2025"
                    onChange={(event) => setReportQuarter(event.target.value)}
                  />
                </label>
              </div>

              <div className={`${styles.grid} ${styles.inputsGrid}`}>
                {coreInputConfig.map(({ key, label }) => (
                  <article key={key} className={styles.inputSourceCard}>
                    <label className={styles.field}>
                      <span>{label}</span>
                      <input
                        type="number"
                        step="any"
                        value={inputs[key]}
                        onChange={(event) => handleInputChange(key, event.target.value)}
                      />
                    </label>
                    <label className={`${styles.field} ${styles.sourceField}`}>
                      <span>Källa</span>
                      <input
                        type="text"
                        value={sources[key]}
                        placeholder="Ex: Q4 2025, s.12"
                        onChange={(event) => handleSourceChange(key, event.target.value)}
                      />
                    </label>
                  </article>
                ))}
              </div>

              {validation.errors.length > 0 && (
                <div className={styles.validationBox}>
                  {validation.errors.map((error) => (
                    <p key={error} className={styles.validationItem}>
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeadingRow}>
                <h2>2) Scenarioantaganden</h2>
                <span className={styles.panelMeta}>Snabbval för multiplar</span>
              </div>

              <div className={styles.profileRow}>
                <label className={`${styles.field} ${styles.profileSelect}`}>
                  <span>Multiple Profile</span>
                  <select
                    value={multipleProfile}
                    onChange={(event) => handleProfileChange(event.target.value as MultipleProfileKey)}
                  >
                    {Object.entries(multipleProfiles).map(([key, profile]) => (
                      <option key={key} value={key}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.multiplePillGroup}>
                  <Pill label="Bear" value={`${inputs.bearMultiple}x`} />
                  <Pill label="Base" value={`${inputs.baseMultiple}x`} />
                  <Pill label="Bull" value={`${inputs.bullMultiple}x`} />
                </div>
              </div>

              <button className={styles.button} onClick={() => setShowAssumptions((prev) => !prev)}>
                {showAssumptions ? 'Dölj tillväxt/deleveraging' : 'Visa tillväxt/deleveraging'}
              </button>

              {showAssumptions && (
                <div className={styles.advancedBlock}>
                  <div className={`${styles.grid} ${styles.advancedGrid}`}>
                    <label className={styles.field}>
                      <span>EBITDA Growth (%)</span>
                      <input
                        type="number"
                        step="any"
                        value={inputs.ebitdaGrowthPct}
                        onChange={(event) => handleInputChange('ebitdaGrowthPct', event.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Debt Paydown (%)</span>
                      <input
                        type="number"
                        step="any"
                        value={inputs.debtPaydownPct}
                        onChange={(event) => handleInputChange('debtPaydownPct', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeadingRow}>
                <h2>3) Snabbanalys</h2>
                <span className={styles.panelMeta}>Base-case i fokus</span>
              </div>

              <div className={`${styles.grid} ${styles.metricsGrid}`}>
                <MetricCard label="Spot Price" value={formatCurrency(inputs.sharePrice)} />
                <MetricCard label="Base Implied Price" value={formatCurrency(metrics.impliedSharePrices.base)} />
                <MetricCard label="Upside / Downside" value={formatSignedPercent(baseUpsideDownside)} />
                <MetricCard
                  label="Forward Base Price"
                  value={formatCurrency(metrics.forwardMetrics.impliedSharePrices.base)}
                />
                <MetricCard
                  label="Forward Upside / Downside"
                  value={formatSignedPercent(forwardUpsideDownside)}
                />
                <MetricCard label="EV / EBITDA" value={formatMultiple(metrics.evToEbitda)} />
                <MetricCard label="FCF Yield" value={formatPercent(metrics.fcfYield)} />
                <MetricCard label="Net Debt / EBITDA" value={formatMultiple(metrics.netDebtToEbitda)} />
              </div>

              <p className={styles.summary}>{quickTake}</p>

              <div className={styles.caseActions}>
                <button
                  className={styles.buttonPrimary}
                  onClick={handleSaveCase}
                  disabled={!validation.isValid}
                >
                  Spara Case
                </button>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeadingRow}>
                <h2>4) Sparade Case</h2>
                <span className={styles.panelMeta}>Jämför och återladda snabbt</span>
              </div>

              {savedCases.length === 0 ? (
                <p className={styles.summary}>Inga case sparade ännu.</p>
              ) : (
                <div className={styles.savedCasesGrid}>
                  {savedCases.map((valuationCase) => (
                    <article key={valuationCase.id} className={styles.savedCaseCard}>
                      <p className={styles.savedCaseTitle}>
                        {valuationCase.companyName} - {valuationCase.reportQuarter}
                      </p>
                      <p className={styles.savedCaseMeta}>
                        Base {formatCurrency(valuationCase.outputs.baseImpliedPrice)} (
                        {formatSignedPercent(valuationCase.outputs.baseUpsideDownside)})
                      </p>
                      <p className={styles.savedCaseMeta}>
                        Källtäckning: {valuationCase.outputs.sourceCoveragePct}%
                      </p>
                      <div className={styles.savedCaseActions}>
                        <button
                          className={`${styles.button} ${styles.buttonSmall}`}
                          onClick={() => handleLoadCase(valuationCase)}
                        >
                          Ladda
                        </button>
                        <button
                          className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
                          onClick={() => handleDeleteCase(valuationCase.id)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeadingRow}>
                <h2>Kommande Versioner</h2>
                <span className={styles.panelMeta}>Nya influenser och ideer</span>
              </div>
              <ul className={styles.ideasList}>
                <li>Rapport-import: klistra in PDF-text och auto-fylla nyckeltal + källrad.</li>
                <li>Peer-multiplar: jämför base-case mot sektorkorg och visa premium/rabatt.</li>
                <li>Kvalitetsscore: vikta marginaltrend, kassaflöde och leverage till en 0-100 score.</li>
                <li>Trigger-logik: flagga när rapportutfall avviker kraftigt mot föregående kvartal.</li>
                <li>Case-timeline: se hur ditt värdeestimat flyttats över flera kvartal.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </article>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.pill}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
