/*
 * Q4Trader Valuation Engine
 * Institutional-style valuation math with strict separation from UI concerns.
 */

/*
 * Numeric safety helpers
 * - toNumber: coerces all inputs into finite numeric values
 * - safeDivide: avoids runtime divide-by-zero errors
 */
const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const safeDivide = (numerator, denominator) => {
  const den = toNumber(denominator);
  if (!den) return 0;
  return toNumber(numerator) / den;
};

/*
 * Display formatters
 * - Shared across current and forward valuation output
 */
export const formatCurrency = (value, digits = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(toNumber(value));
};

export const formatMultiple = (value, digits = 2) => `${toNumber(value).toFixed(digits)}x`;

export const formatPercent = (value, digits = 2) => `${(toNumber(value) * 100).toFixed(digits)}%`;

/*
 * Current-period valuation functions
 */
export const calculateMarketCap = (sharePrice, sharesOutstanding) => {
  return toNumber(sharePrice) * toNumber(sharesOutstanding);
};

export const calculateEnterpriseValue = (marketCap, netDebt) => {
  return toNumber(marketCap) + toNumber(netDebt);
};

export const calculateEvToEbitda = (enterpriseValue, ebitda) => {
  return safeDivide(enterpriseValue, ebitda);
};

export const calculateFcfYield = (freeCashFlow, marketCap) => {
  return safeDivide(freeCashFlow, marketCap);
};

export const calculateNetDebtToEbitda = (netDebt, ebitda) => {
  return safeDivide(netDebt, ebitda);
};

export const calculateImpliedSharePrice = (multiple, ebitda, netDebt, sharesOutstanding) => {
  const impliedEnterpriseValue = toNumber(multiple) * toNumber(ebitda);
  const impliedEquityValue = impliedEnterpriseValue - toNumber(netDebt);
  const impliedSharePrice = safeDivide(impliedEquityValue, sharesOutstanding);
  return Math.max(0, impliedSharePrice);
};

/*
 * Forward projection functions
 * - Growth/paydown inputs are percentages, e.g. 10 => 10%
 * - Defaults preserve backward compatibility when inputs are omitted
 */
export const calculateForwardEbitda = (currentEbitda, ebitdaGrowthPct = 0) => {
  return toNumber(currentEbitda) * (1 + toNumber(ebitdaGrowthPct) / 100);
};

export const calculateForwardNetDebt = (currentNetDebt, debtPaydownPct = 0) => {
  return toNumber(currentNetDebt) * (1 - toNumber(debtPaydownPct) / 100);
};

export const calculateForwardImpliedSharePrice = (
  multiple,
  forwardEbitda,
  forwardNetDebt,
  sharesOutstanding
) => {
  const forwardEnterpriseValue = toNumber(forwardEbitda) * toNumber(multiple);
  const forwardEquityValue = forwardEnterpriseValue - toNumber(forwardNetDebt);
  const impliedSharePrice = safeDivide(forwardEquityValue, sharesOutstanding);
  return Math.max(0, impliedSharePrice);
};

/*
 * EV/EBITDA multiple sensitivity analysis
 * - Applies a forward EBITDA and forward net debt framework across a multiple range
 * - Converts each EV point into equity value and per-share implied value
 * - Floors implied share price at zero for distressed-capital-structure scenarios
 */
export const generateMultipleSensitivity = (
  forwardEbitda,
  forwardNetDebt,
  sharesOutstanding,
  minMultiple = 5,
  maxMultiple = 15,
  step = 0.5
) => {
  const min = toNumber(minMultiple);
  const max = toNumber(maxMultiple);
  const increment = toNumber(step);

  if (increment <= 0 || min > max) return [];

  const sensitivity = [];
  const ebitda = toNumber(forwardEbitda);
  const netDebtValue = toNumber(forwardNetDebt);

  for (let multiple = min; multiple <= max + 1e-9; multiple += increment) {
    const normalizedMultiple = Number(multiple.toFixed(4));
    const forwardEnterpriseValue = normalizedMultiple * ebitda;
    const forwardEquityValue = forwardEnterpriseValue - netDebtValue;
    const rawImpliedSharePrice = safeDivide(forwardEquityValue, sharesOutstanding);
    const impliedSharePrice = Math.max(0, rawImpliedSharePrice);

    sensitivity.push({
      multiple: normalizedMultiple,
      impliedSharePrice
    });
  }

  return sensitivity;
};

/*
 * Core valuation runner
 * Returns:
 * - Current valuation metrics
 * - forwardMetrics object with projected EBITDA, projected net debt, and forward scenario prices
 */
export const runValuation = ({
  sharePrice,
  sharesOutstanding,
  netDebt,
  ebitda,
  freeCashFlow,
  bullMultiple,
  baseMultiple,
  bearMultiple,
  ebitdaGrowthPct = 0,
  debtPaydownPct = 0
}) => {
  const marketCap = calculateMarketCap(sharePrice, sharesOutstanding);
  const enterpriseValue = calculateEnterpriseValue(marketCap, netDebt);
  const evToEbitda = calculateEvToEbitda(enterpriseValue, ebitda);
  const fcfYield = calculateFcfYield(freeCashFlow, marketCap);
  const netDebtToEbitda = calculateNetDebtToEbitda(netDebt, ebitda);

  const impliedSharePrices = {
    bull: calculateImpliedSharePrice(bullMultiple, ebitda, netDebt, sharesOutstanding),
    base: calculateImpliedSharePrice(baseMultiple, ebitda, netDebt, sharesOutstanding),
    bear: calculateImpliedSharePrice(bearMultiple, ebitda, netDebt, sharesOutstanding)
  };

  const forwardEbitda = calculateForwardEbitda(ebitda, ebitdaGrowthPct);
  const forwardNetDebt = calculateForwardNetDebt(netDebt, debtPaydownPct);

  const forwardMetrics = {
    forwardEbitda,
    forwardNetDebt,
    impliedSharePrices: {
      bull: calculateForwardImpliedSharePrice(
        bullMultiple,
        forwardEbitda,
        forwardNetDebt,
        sharesOutstanding
      ),
      base: calculateForwardImpliedSharePrice(
        baseMultiple,
        forwardEbitda,
        forwardNetDebt,
        sharesOutstanding
      ),
      bear: calculateForwardImpliedSharePrice(
        bearMultiple,
        forwardEbitda,
        forwardNetDebt,
        sharesOutstanding
      )
    }
  };

  return {
    marketCap,
    enterpriseValue,
    evToEbitda,
    fcfYield,
    netDebtToEbitda,
    impliedSharePrices,
    forwardMetrics
  };
};

/*
 * Analyst summary generator
 * - Combines current valuation and forward projected re-rating/de-rating profile
 * - Includes leverage commentary for balance-sheet risk framing
 */
export const generateAnalystSummary = (inputs, metrics) => {
  const { sharePrice, ebitdaGrowthPct = 0, debtPaydownPct = 0 } = inputs;
  const {
    marketCap,
    enterpriseValue,
    evToEbitda,
    fcfYield,
    netDebtToEbitda,
    impliedSharePrices,
    forwardMetrics
  } = metrics;

  const currentPrice = toNumber(sharePrice);
  const currentUpsideDownside = safeDivide(impliedSharePrices.base - currentPrice, currentPrice);
  const forwardUpsideDownside = safeDivide(
    forwardMetrics.impliedSharePrices.base - currentPrice,
    currentPrice
  );

  const valuationTone =
    currentUpsideDownside > 0.15
      ? 'appears undervalued versus our base-case intrinsic value estimate'
      : currentUpsideDownside < -0.15
        ? 'screens rich relative to our base-case valuation framework'
        : 'appears broadly in line with our base-case fair value estimate';

  const leverageTone =
    netDebtToEbitda > 3
      ? 'Balance sheet leverage remains elevated and should be monitored closely.'
      : netDebtToEbitda > 1.5
        ? 'Leverage is manageable but remains a relevant equity risk factor.'
        : 'Balance sheet leverage appears conservative.';

  const forwardTone =
    forwardUpsideDownside > currentUpsideDownside
      ? 'Forward valuation improves as projected EBITDA expansion and debt reduction support equity accretion.'
      : 'Forward valuation remains constrained, suggesting limited re-rating without stronger operating delivery.';

  return `At ${formatCurrency(currentPrice)}, Q4Trader implies a current equity value of ${formatCurrency(marketCap, 0)} and enterprise value of ${formatCurrency(enterpriseValue, 0)}, or ${formatMultiple(evToEbitda)} EV/EBITDA. The company screens at an implied ${formatPercent(fcfYield)} FCF yield with net leverage of ${formatMultiple(netDebtToEbitda)}. Current scenario valuation spans ${formatCurrency(impliedSharePrices.bear)} (bear) to ${formatCurrency(impliedSharePrices.bull)} (bull), with a base-case implied share price of ${formatCurrency(impliedSharePrices.base)}, indicating the stock ${valuationTone}. On a forward basis, assuming ${toNumber(ebitdaGrowthPct).toFixed(1)}% EBITDA growth and ${toNumber(debtPaydownPct).toFixed(1)}% debt paydown, base-case implied value moves to ${formatCurrency(forwardMetrics.impliedSharePrices.base)} (bull ${formatCurrency(forwardMetrics.impliedSharePrices.bull)} / bear ${formatCurrency(forwardMetrics.impliedSharePrices.bear)}). ${forwardTone} ${leverageTone}`;
};
