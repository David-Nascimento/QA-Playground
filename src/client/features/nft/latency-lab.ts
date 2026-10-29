// ========================================
// Laboratório de latência: por que a média engana
// ----------------------------------------
// Ativado em elementos #latency-lab. Gera latências com cauda longa,
// mostra média x percentis, histograma e o veredito de um SLO de p95.
// ========================================

import { formatMs, histogram, sampleLatencies, summarize, type Summary } from './stats.js';

const SIGMA: Record<string, number> = { estavel: 0.2, moderada: 0.45, instavel: 0.85 };

const num = (root: HTMLElement, sel: string, fallback: number) => {
  const v = Number((root.querySelector(sel) as HTMLInputElement | null)?.value);
  return Number.isFinite(v) ? v : fallback;
};

function renderHistogram(svg: SVGSVGElement, values: number[], s: Summary): void {
  const W = 640;
  const H = 220;
  const pad = { l: 36, r: 12, t: 16, b: 34 };
  const ceiling = Math.max(s.p99 * 1.15, s.p50 * 2);
  const buckets = histogram(values, 32, ceiling);
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const x = (ms: number) => pad.l + (Math.min(ms, ceiling) / ceiling) * (W - pad.l - pad.r);
  const y = (c: number) => H - pad.b - (c / maxCount) * (H - pad.t - pad.b);
  const bw = (W - pad.l - pad.r) / buckets.length;

  const bars = buckets
    .map((b, i) => {
      const tail = b.from >= s.p95;
      return `<rect x="${pad.l + i * bw + 1}" y="${y(b.count)}" width="${Math.max(bw - 2, 1)}" height="${H - pad.b - y(b.count)}" rx="2" class="${tail ? 'bar-tail' : 'bar'}"><title>${formatMs(b.from)}–${formatMs(b.to)}: ${b.count} requisições</title></rect>`;
    })
    .join('');

  const marker = (ms: number, label: string, cls: string, row: number) =>
    `<g class="${cls}"><line x1="${x(ms)}" x2="${x(ms)}" y1="${pad.t}" y2="${H - pad.b}"/><text x="${x(ms) + 4}" y="${pad.t + 12 + row * 14}">${label} ${formatMs(ms)}</text></g>`;

  const ticks = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => `<text class="tick" x="${x(ceiling * f)}" y="${H - 12}" text-anchor="middle">${formatMs(ceiling * f)}</text>`)
    .join('');

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${H - pad.b}" y2="${H - pad.b}"/>${bars}${ticks}
    ${marker(s.mean, 'média', 'mk-mean', 0)}${marker(s.p95, 'p95', 'mk-p95', 1)}${marker(s.p99, 'p99', 'mk-p99', 2)}`;
}

function initLab(root: HTMLElement): void {
  const run = () => {
    const median = num(root, '[data-lab="median"]', 200);
    const sigma = SIGMA[(root.querySelector('[data-lab="spread"]') as HTMLSelectElement | null)?.value ?? 'moderada'] ?? 0.45;
    const outlierRate = num(root, '[data-lab="outliers"]', 2) / 100;
    const count = num(root, '[data-lab="count"]', 500);
    const slo = num(root, '[data-lab="slo"]', 400);
    const seed = num(root, '[data-lab="seed"]', 42);

    const values = sampleLatencies({ median, sigma, outlierRate, outlierFactor: 6 }, count, seed);
    const s = summarize(values);

    const set = (key: string, text: string) => {
      const el = root.querySelector(`[data-out="${key}"]`);
      if (el) el.textContent = text;
    };
    set('mean', formatMs(s.mean));
    set('p50', formatMs(s.p50));
    set('p95', formatMs(s.p95));
    set('p99', formatMs(s.p99));
    set('max', formatMs(s.max));

    const pass = s.p95 <= slo;
    const verdict = root.querySelector('[data-out="slo"]');
    if (verdict) {
      verdict.className = `nft-slo ${pass ? 'is-pass' : 'is-fail'}`;
      verdict.textContent = pass
        ? `SLO atendido: p95 de ${formatMs(s.p95)} ≤ ${formatMs(slo)}`
        : `SLO violado: p95 de ${formatMs(s.p95)} > ${formatMs(slo)}`;
    }
    const slow = values.filter((v) => v > s.mean * 2).length;
    set(
      'insight',
      `A média (${formatMs(s.mean)}) parece boa, mas 1 em cada 20 requisições levou mais de ${formatMs(s.p95)} e 1 em cada 100 passou de ${formatMs(s.p99)}. ` +
        `${slow} de ${count} requisições demoraram mais que o dobro da média. Por isso SLOs e thresholds usam percentis, não médias.`
    );
    const svg = root.querySelector<SVGSVGElement>('svg[data-out="histogram"]');
    if (svg) renderHistogram(svg, values, s);
  };

  root.querySelector('[data-lab="run"]')?.addEventListener('click', run);
  root.querySelectorAll('input, select').forEach((el) =>
    el.addEventListener('change', run)
  );
  root.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((el) => {
    const out = root.querySelector(`[data-show="${el.dataset.lab}"]`);
    const sync = () => {
      if (out) out.textContent = el.dataset.unit === '%' ? `${el.value}%` : formatMs(Number(el.value));
    };
    el.addEventListener('input', sync);
    sync();
  });
  run();
}

export function initLatencyLab(): void {
  document.querySelectorAll<HTMLElement>('#latency-lab').forEach(initLab);
}
