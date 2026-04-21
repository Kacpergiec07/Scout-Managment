/**
 * Benchmarking utility for calculating percentiles and league medians.
 */

export interface BenchmarkResult {
  median: number;
  percentile: number;
}

/**
 * Calculates the percentile of a value in a dataset.
 * 0 = lowest, 100 = highest.
 */
export function calculatePercentile(value: number, cohort: number[]): number {
  if (cohort.length === 0) return 0;
  
  const sorted = [...cohort].sort((a, b) => a - b);
  const count = sorted.filter(v => v < value).length;
  
  return Math.round((count / cohort.length) * 100);
}

/**
 * Generates a full benchmark for a set of statistics.
 */
export function getStatsBenchmark(value: number, cohort: number[]): BenchmarkResult {
  if (cohort.length === 0) return { median: 0, percentile: 0 };
  
  const sorted = [...cohort].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  
  return {
    median,
    percentile: calculatePercentile(value, cohort)
  };
}
