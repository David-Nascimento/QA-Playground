// ========================================
// NFT - estatística para testes de performance
// ----------------------------------------
// Percentis (p50/p95/p99), histograma e um gerador pseudoaleatório com
// semente: a mesma semente sempre produz os mesmos números, o que torna os
// laboratórios reproduzíveis em testes automatizados.
// ========================================

/** Gerador mulberry32: rápido, determinístico e bom o bastante para simulação. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal padrão (Box-Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface LatencyModel {
  /** latência típica (mediana) em ms */
  median: number;
  /** dispersão da log-normal: 0.2 estável, 0.5 moderada, 0.9 instável */
  sigma: number;
  /** fração de requisições muito lentas (ex.: GC, cache frio, fila) */
  outlierRate: number;
  /** quantas vezes mais lentas são as requisições "outlier" */
  outlierFactor: number;
}

/**
 * Latências reais não seguem uma curva normal: têm cauda longa à direita.
 * A log-normal com alguns outliers reproduz esse formato.
 */
export function sampleLatencies(model: LatencyModel, count: number, seed: number): number[] {
  const rand = seededRandom(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    let v = model.median * Math.exp(model.sigma * gaussian(rand));
    if (rand() < model.outlierRate) v *= model.outlierFactor * (0.7 + rand() * 0.6);
    out.push(Math.max(1, Math.round(v)));
  }
  return out;
}

/** Percentil por interpolação linear (mesmo método do k6 e do numpy). */
export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export interface Summary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  stdev: number;
}

export function summarize(values: number[]): Summary {
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const mean = count ? sorted.reduce((s, v) => s + v, 0) / count : 0;
  const variance = count ? sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / count : 0;
  return {
    count,
    min: sorted[0] ?? 0,
    max: sorted[count - 1] ?? 0,
    mean,
    p50: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    stdev: Math.sqrt(variance),
  };
}

export interface Bucket {
  from: number;
  to: number;
  count: number;
}

/** Histograma com faixas de largura igual até um teto (o resto vai na última faixa). */
export function histogram(values: number[], buckets: number, ceiling: number): Bucket[] {
  const width = ceiling / buckets;
  const out: Bucket[] = Array.from({ length: buckets }, (_, i) => ({ from: i * width, to: (i + 1) * width, count: 0 }));
  values.forEach((v) => {
    const i = Math.min(buckets - 1, Math.floor(v / width));
    out[i].count++;
  });
  return out;
}

export const formatMs = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 2).replace('.', ',')} s` : `${Math.round(ms)} ms`;
