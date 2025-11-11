import type { Metric } from 'web-vitals';

const logMetric = (metric: Metric) => {
  const { name, value, rating } = metric;
  // eslint-disable-next-line no-console
  console.info(
    `[WebVitals] ${name}: ${value.toFixed(2)} (${rating})`,
    metric
  );
};

export const initWebVitals = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  const webVitalsModule = await import('web-vitals');
  const candidates: Array<[string, unknown]> = Object.entries(webVitalsModule);

  candidates.forEach(([name, fn]) => {
    if (typeof fn === 'function' && name.startsWith('on')) {
      try {
        fn(logMetric);
      } catch (error) {
        console.warn(`[WebVitals] Métrica ${name} não pôde ser inicializada.`, error);
      }
    }
  });
};

