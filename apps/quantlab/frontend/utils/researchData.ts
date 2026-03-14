type SimulationModel = 'gbm' | 'ou' | 'jump';

type SimulationParams = {
  model: SimulationModel;
  numberOfPaths: number;
  timeHorizon: number;
  timeSteps: number;
  initialValue: number;
  drift: number;
  volatility: number;
  theta: number;
  meanLevel: number;
  jumpIntensity: number;
  jumpMean: number;
  jumpStd: number;
  seed: number;
};

type MeanReversionParams = {
  entryZScore: number;
  exitZScore: number;
  hedgeRatio: number;
  observations: number;
  seed: number;
};

export type SimulationDataset = {
  timeGrid: number[];
  paths: number[][];
  meanPath: number[];
  lowerBand: number[];
  upperBand: number[];
  terminalMean: number;
  terminalP05: number;
  terminalP95: number;
};

export type StrategyMetrics = {
  cumulativeReturns: number;
  sharpeRatio: number;
  maxDrawdown: number;
  tradeCount: number;
};

export type MeanReversionDataset = {
  dates: string[];
  assetA: number[];
  assetB: number[];
  spread: number[];
  equilibrium: number[];
  buySignals: Array<{ x: string; y: number }>;
  sellSignals: Array<{ x: string; y: number }>;
  signals: Array<{ date: string; action: 'Buy' | 'Sell' | 'Exit'; spread: number; zScore: number }>;
  metrics: StrategyMetrics;
  calibration: {
    theta: number;
    mu: number;
    sigma: number;
    halfLife: number;
  };
};

export type RegimeDataset = {
  dates: string[];
  prices: number[];
  returns: number[];
  regimeStates: number[];
  regimeLabels: string[];
  regimeProbabilities: number[][];
  uniqueRegimeLabels: string[];
  regimeCounts: Array<{ label: string; count: number }>;
};

function mulberry32(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function percentile(values: number[], q: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * q)));
  return sorted[index];
}

export function generateSimulationDataset(params: SimulationParams): SimulationDataset {
  const random = mulberry32(params.seed);
  const timeGrid = Array.from({ length: params.timeSteps }, (_, index) =>
    (params.timeHorizon * index) / Math.max(params.timeSteps - 1, 1)
  );

  const paths = Array.from({ length: params.numberOfPaths }, () => {
    const path = new Array<number>(params.timeSteps);
    path[0] = params.initialValue;

    for (let step = 1; step < params.timeSteps; step += 1) {
      const dt = params.timeHorizon / Math.max(params.timeSteps - 1, 1);
      const shock = gaussian(random);
      const previous = path[step - 1];

      if (params.model === 'gbm') {
        const increment =
          (params.drift - 0.5 * params.volatility * params.volatility) * dt +
          params.volatility * Math.sqrt(dt) * shock;
        path[step] = previous * Math.exp(increment);
      } else if (params.model === 'ou') {
        const decay = Math.exp(-params.theta * dt);
        const std =
          params.theta === 0
            ? params.volatility * Math.sqrt(dt)
            : params.volatility * Math.sqrt((1 - Math.exp(-2 * params.theta * dt)) / (2 * params.theta));
        path[step] = previous * decay + params.meanLevel * (1 - decay) + std * shock;
      } else {
        const jumpCount = samplePoisson(params.jumpIntensity * dt, random);
        const jumpShock = jumpCount * params.jumpMean + Math.sqrt(jumpCount) * params.jumpStd * gaussian(random);
        const jumpCompensator = Math.exp(params.jumpMean + 0.5 * params.jumpStd * params.jumpStd) - 1;
        const increment =
          (params.drift - 0.5 * params.volatility * params.volatility - params.jumpIntensity * jumpCompensator) *
            dt +
          params.volatility * Math.sqrt(dt) * shock +
          jumpShock;
        path[step] = previous * Math.exp(increment);
      }
    }

    return path;
  });

  const meanPath = timeGrid.map((_, index) => average(paths.map((path) => path[index])));
  const lowerBand = timeGrid.map((_, index) => percentile(paths.map((path) => path[index]), 0.05));
  const upperBand = timeGrid.map((_, index) => percentile(paths.map((path) => path[index]), 0.95));
  const terminalValues = paths.map((path) => path[path.length - 1]);

  return {
    timeGrid,
    paths,
    meanPath,
    lowerBand,
    upperBand,
    terminalMean: average(terminalValues),
    terminalP05: percentile(terminalValues, 0.05),
    terminalP95: percentile(terminalValues, 0.95)
  };
}

function samplePoisson(lambda: number, random: () => number) {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  while (product > threshold) {
    count += 1;
    product *= random();
  }

  return count - 1;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

export function generateMeanReversionDataset(params: MeanReversionParams): MeanReversionDataset {
  const random = mulberry32(params.seed);
  const dates = Array.from({ length: params.observations }, (_, index) => {
    const date = new Date(Date.UTC(2024, 0, 1 + index));
    return date.toISOString().slice(0, 10);
  });

  const theta = 6.4;
  const mu = 0.2;
  const sigma = 1.15;
  const dt = 1 / 252;
  const spread = new Array<number>(params.observations);
  spread[0] = mu;

  for (let index = 1; index < params.observations; index += 1) {
    const shock = gaussian(random);
    spread[index] =
      spread[index - 1] + theta * (mu - spread[index - 1]) * dt + sigma * Math.sqrt(dt) * shock;
  }

  const assetB = new Array<number>(params.observations);
  const assetA = new Array<number>(params.observations);
  assetB[0] = 100;
  assetA[0] = params.hedgeRatio * assetB[0] + spread[0];

  for (let index = 1; index < params.observations; index += 1) {
    assetB[index] = assetB[index - 1] * Math.exp(0.0005 + 0.012 * gaussian(random));
    assetA[index] = params.hedgeRatio * assetB[index] + spread[index];
  }

  const stationaryStd = sigma / Math.sqrt(2 * theta);
  const zScores = spread.map((value) => (value - mu) / stationaryStd);
  const equilibrium = spread.map(() => mu);
  const position = new Array<number>(params.observations).fill(0);
  const signals: MeanReversionDataset['signals'] = [];
  const buySignals: MeanReversionDataset['buySignals'] = [];
  const sellSignals: MeanReversionDataset['sellSignals'] = [];

  for (let index = 1; index < params.observations; index += 1) {
    const previousPosition = position[index - 1];
    let nextPosition = previousPosition;

    if (zScores[index] <= -params.entryZScore) {
      nextPosition = 1;
      buySignals.push({ x: dates[index], y: spread[index] });
      signals.push({ date: dates[index], action: 'Buy', spread: spread[index], zScore: zScores[index] });
    } else if (zScores[index] >= params.entryZScore) {
      nextPosition = -1;
      sellSignals.push({ x: dates[index], y: spread[index] });
      signals.push({ date: dates[index], action: 'Sell', spread: spread[index], zScore: zScores[index] });
    } else if (Math.abs(zScores[index]) <= params.exitZScore) {
      nextPosition = 0;
      if (previousPosition !== 0) {
        signals.push({ date: dates[index], action: 'Exit', spread: spread[index], zScore: zScores[index] });
      }
    }

    position[index] = nextPosition;
  }

  const returns = spread.map((value, index) => {
    if (index === 0) return 0;
    return position[index - 1] * (spread[index] - spread[index - 1]);
  });
  const cumulativeCurve = returns.reduce<number[]>((curve, value) => {
    const previous = curve[curve.length - 1] ?? 0;
    curve.push(previous + value);
    return curve;
  }, []);
  const runningPeak = cumulativeCurve.reduce<number[]>((peaks, value) => {
    const nextPeak = Math.max(peaks[peaks.length - 1] ?? value, value);
    peaks.push(nextPeak);
    return peaks;
  }, []);
  const drawdowns = cumulativeCurve.map((value, index) => value - runningPeak[index]);
  const returnsMean = average(returns);
  const returnsStd = Math.sqrt(average(returns.map((value) => (value - returnsMean) ** 2)));

  return {
    dates,
    assetA,
    assetB,
    spread,
    equilibrium,
    buySignals,
    sellSignals,
    signals,
    metrics: {
      cumulativeReturns: cumulativeCurve[cumulativeCurve.length - 1] ?? 0,
      sharpeRatio: returnsStd > 0 ? (Math.sqrt(252) * returnsMean) / returnsStd : 0,
      maxDrawdown: Math.min(...drawdowns),
      tradeCount: signals.filter((signal) => signal.action !== 'Exit').length
    },
    calibration: {
      theta,
      mu,
      sigma,
      halfLife: Math.log(2) / theta
    }
  };
}

export function generateRegimeDataset(seed = 91, observations = 220): RegimeDataset {
  const random = mulberry32(seed);
  const dates = Array.from({ length: observations }, (_, index) => {
    const date = new Date(Date.UTC(2024, 0, 1 + index));
    return date.toISOString().slice(0, 10);
  });

  const labels = ['low volatility regime', 'high volatility regime', 'crash regime'];
  const transitionMatrix = [
    [0.92, 0.07, 0.01],
    [0.10, 0.82, 0.08],
    [0.18, 0.25, 0.57]
  ];
  const drifts = [0.0006, -0.0001, -0.0028];
  const vols = [0.006, 0.016, 0.033];

  const regimeStates = new Array<number>(observations).fill(0);
  const returns = new Array<number>(observations).fill(0);
  const prices = new Array<number>(observations).fill(100);
  const regimeProbabilities = Array.from({ length: observations }, () => [0, 0, 0]);

  regimeProbabilities[0] = [0.84, 0.13, 0.03];

  for (let index = 1; index < observations; index += 1) {
    regimeStates[index] = drawCategorical(transitionMatrix[regimeStates[index - 1]], random);
    returns[index] = drifts[regimeStates[index]] + vols[regimeStates[index]] * gaussian(random);
    prices[index] = prices[index - 1] * Math.exp(returns[index]);

    const target = transitionMatrix[regimeStates[index]];
    regimeProbabilities[index] = target.map((value, probabilityIndex) => {
      const perturbation = (random() - 0.5) * 0.08;
      const adjusted = probabilityIndex === regimeStates[index] ? value + Math.abs(perturbation) : value + perturbation;
      return Math.max(adjusted, 0.01);
    });
    const normalizer = regimeProbabilities[index].reduce((sum, value) => sum + value, 0);
    regimeProbabilities[index] = regimeProbabilities[index].map((value) => value / normalizer);
  }

  const regimeLabels = regimeStates.map((state) => labels[state]);
  const regimeCounts = labels.map((label, index) => ({
    label,
    count: regimeStates.filter((state) => state === index).length
  }));

  return {
    dates,
    prices,
    returns,
    regimeStates,
    regimeLabels,
    regimeProbabilities,
    uniqueRegimeLabels: labels,
    regimeCounts
  };
}

function drawCategorical(probabilities: number[], random: () => number) {
  const threshold = random();
  let cumulative = 0;

  for (let index = 0; index < probabilities.length; index += 1) {
    cumulative += probabilities[index];
    if (threshold <= cumulative) return index;
  }

  return probabilities.length - 1;
}
