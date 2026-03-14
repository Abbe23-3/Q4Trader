/*
 * Q4Trader Valuation Engine
 * Institutional-style valuation math with strict separation from UI concerns.
 */

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const safeDivide = (numerator: unknown, denominator: unknown) => {
  const den = toNumber(denominator);
  if (!den) return 0;
  return toNumber(numerator) / den;
};

export const formatCurrency = (value: unknown, digits = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(toNumber(value));
};

export const formatMultiple = (value: unknown, digits = 2) => `${toNumber(value).toFixed(digits)}x`;

export const formatPercent = (value: unknown, digits = 2) => `${(toNumber(value) * 100).toFixed(digits)}%`;

export const calculateMarketCap = (sharePrice: unknown, sharesOutstanding: unknown) => {
  return toNumber(sharePrice) * toNumber(sharesOutstanding);
};

export const calculateEnterpriseValue = (marketCap: unknown, netDebt: unknown) => {
  return toNumber(marketCap) + toNumber(netDebt);
};

export const calculateEvToEbitda = (enterpriseValue: unknown, ebitda: unknown) => {
  return safeDivide(enterpriseValue, ebitda);
};

export const calculateFcfYield = (freeCashFlow: unknown, marketCap: unknown) => {
  return safeDivide(freeCashFlow, marketCap);
};

export const calculateNetDebtToEbitda = (netDebt: unknown, ebitda: unknown) => {
  return safeDivide(netDebt, ebitda);
};

export const calculateImpliedSharePrice = (
  multiple: unknown,
  ebitda: unknown,
  netDebt: unknown,
  sharesOutstanding: unknown
) => {
  const impliedEnterpriseValue = toNumber(multiple) * toNumber(ebitda);
  const impliedEquityValue = impliedEnterpriseValue - toNumber(netDebt);
  const impliedSharePrice = safeDivide(impliedEquityValue, sharesOutstanding);
  return Math.max(0, impliedSharePrice);
};

export const calculateForwardEbitda = (currentEbitda: unknown, ebitdaGrowthPct = 0) => {
  return toNumber(currentEbitda) * (1 + toNumber(ebitdaGrowthPct) / 100);
};

export const calculateForwardNetDebt = (currentNetDebt: unknown, debtPaydownPct = 0) => {
  return toNumber(currentNetDebt) * (1 - toNumber(debtPaydownPct) / 100);
};

export const calculateForwardImpliedSharePrice = (
  multiple: unknown,
  forwardEbitda: unknown,
  forwardNetDebt: unknown,
  sharesOutstanding: unknown
) => {
  const forwardEnterpriseValue = toNumber(forwardEbitda) * toNumber(multiple);
  const forwardEquityValue = forwardEnterpriseValue - toNumber(forwardNetDebt);
  const impliedSharePrice = safeDivide(forwardEquityValue, sharesOutstanding);
  return Math.max(0, impliedSharePrice);
};

export const generateMultipleSensitivity = (
  forwardEbitda: unknown,
  forwardNetDebt: unknown,
  sharesOutstanding: unknown,
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

export type ValuationInputs = {
  sharePrice: number;
  sharesOutstanding: number;
  netDebt: number;
  ebitda: number;
  freeCashFlow: number;
  bullMultiple: number;
  baseMultiple: number;
  bearMultiple: number;
  ebitdaGrowthPct?: number;
  debtPaydownPct?: number;
};

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
}: ValuationInputs) => {
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
