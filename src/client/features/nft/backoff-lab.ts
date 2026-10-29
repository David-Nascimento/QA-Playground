// ========================================
// Laboratório de retry: intervalo fixo x backoff exponencial x jitter
// ----------------------------------------
// Ativado em #backoff-lab. Simula N clientes que falham durante uma queda
// do servidor e tentam de novo. Quando o servidor volta com capacidade
// limitada, retries sincronizados chegam todos juntos ("thundering herd")
// e causam novas falhas. Jitter espalha as tentativas no tempo.
// ========================================

import { seededRandom } from './stats.js';

export type Strategy = 'fixed' | 'exponential' | 'jitter';

export interface BackoffParams {
  clients: number;
  /** segundos com o servidor fora do ar */
  outage: number;
  /** requisições por segundo que o servidor aguenta depois de voltar */
  capacity: number;
  /** atraso base em segundos */
  base: number;
  /** teto do atraso em segundos */
  cap: number;
  maxAttempts: number;
  seed: number;
}

export interface BackoffResult {
  strategy: Strategy;
  /** tentativas por janela de 0,5 s */
  series: number[];
  attempts: number;
  /** maior número de tentativas em 0,5 s depois que o servidor voltou */
  peak: number;
  /** segundos até o último cliente ter sucesso (ou desistir) */
  settledAt: number;
  succeeded: number;
  gaveUp: number;
  /** clientes que ainda estavam tentando quando a simulação acabou */
  pending: number;
}

const STEP = 0.05; // resolução da simulação (s)
const BUCKET = 0.5; // janela do gráfico (s)
const HORIZON = 40; // s

export function delayFor(strategy: Strategy, attempt: number, p: BackoffParams, rand: () => number): number {
  const exp = Math.min(p.cap, p.base * 2 ** (attempt - 1));
  if (strategy === 'fixed') return p.base;
  if (strategy === 'exponential') return exp;
  return rand() * exp; // "full jitter" (AWS Architecture Blog)
}

export function simulate(strategy: Strategy, p: BackoffParams): BackoffResult {
  const rand = seededRandom(p.seed);
  // Todos começam quase juntos (ex.: um deploy derrubou o serviço no horário de pico)
  const clients = Array.from({ length: p.clients }, () => ({ next: rand() * 0.5, attempt: 0, done: false }));
  const series = new Array(Math.ceil(HORIZON / BUCKET)).fill(0);
  let attempts = 0;
  let settledAt = 0;
  let succeeded = 0;
  let gaveUp = 0;
  let budget = 0;

  for (let t = 0; t < HORIZON; t += STEP) {
    // Capacidade acumula por passo (com uma pequena folga de rajada)
    budget = t >= p.outage ? Math.min(budget + p.capacity * STEP, p.capacity * STEP * 2) : 0;
    const due = clients.filter((c) => !c.done && c.next <= t);
    if (!due.length) {
      if (clients.every((c) => c.done)) break;
      continue;
    }
    // ordem aleatória: quem é atendido primeiro dentro da janela
    due.sort(() => rand() - 0.5);
    for (const c of due) {
      c.attempt++;
      attempts++;
      series[Math.min(series.length - 1, Math.floor(t / BUCKET))]++;
      if (t >= p.outage && budget >= 1) {
        budget -= 1;
        c.done = true;
        succeeded++;
        settledAt = Math.max(settledAt, t);
      } else if (c.attempt >= p.maxAttempts) {
        c.done = true;
        gaveUp++;
        settledAt = Math.max(settledAt, t);
      } else {
        c.next = t + delayFor(strategy, c.attempt, p, rand);
      }
    }
  }
  // Pico depois que o servidor volta: é aí que retries sincronizados derrubam o serviço de novo
  const peak = Math.max(0, ...series.slice(Math.ceil(p.outage / BUCKET)));
  return { strategy, series, attempts, peak, settledAt, succeeded, gaveUp, pending: p.clients - succeeded - gaveUp };
}

const LABEL: Record<Strategy, string> = {
  fixed: 'Intervalo fixo',
  exponential: 'Backoff exponencial',
  jitter: 'Exponencial + jitter',
};

function chart(results: BackoffResult[], capacity: number, outage: number): string {
  const W = 640;
  const H = 230;
  const pad = { l: 40, r: 12, t: 14, b: 30 };
  const n = results[0].series.length;
  const lastActive = Math.max(...results.map((r) => r.series.reduce((last, v, i) => (v ? i : last), 0))) + 2;
  const len = Math.min(n, Math.max(lastActive, 12));
  const max = Math.max(...results.flatMap((r) => r.series.slice(0, len)), capacity * BUCKET, 1);
  const x = (i: number) => pad.l + (i / (len - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const lines = results
    .map((r) => `<polyline class="ln ln-${r.strategy}" points="${r.series.slice(0, len).map((v, i) => `${x(i)},${y(v)}`).join(' ')}"><title>${LABEL[r.strategy]}</title></polyline>`)
    .join('');
  const capY = y(capacity * BUCKET);
  const outX = x(outage / BUCKET);
  const ticks = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const i = Math.round((len - 1) * f);
      return `<text class="tick" x="${x(i)}" y="${H - 10}" text-anchor="middle">${(i * BUCKET).toFixed(0)} s</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tentativas por meio segundo para cada estratégia">
    <rect class="outage" x="${pad.l}" y="${pad.t}" width="${Math.max(outX - pad.l, 0)}" height="${H - pad.t - pad.b}"/>
    <text class="outage-label" x="${pad.l + 6}" y="${pad.t + 14}">servidor fora do ar</text>
    <line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${H - pad.b}" y2="${H - pad.b}"/>
    <line class="cap" x1="${pad.l}" x2="${W - pad.r}" y1="${capY}" y2="${capY}"/>
    <text class="cap-label" x="${W - pad.r - 4}" y="${capY - 6}" text-anchor="end">capacidade do servidor</text>
    ${lines}${ticks}</svg>`;
}

function initLab(root: HTMLElement): void {
  const read = (key: string, fallback: number) => {
    const v = Number((root.querySelector(`[data-lab="${key}"]`) as HTMLInputElement | null)?.value);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };

  const run = () => {
    const p: BackoffParams = {
      clients: read('clients', 300),
      outage: read('outage', 4),
      capacity: read('capacity', 80),
      base: read('base', 1),
      cap: read('cap', 16),
      maxAttempts: read('max', 10),
      seed: read('seed', 7),
    };
    const results = (['fixed', 'exponential', 'jitter'] as Strategy[]).map((s) => simulate(s, p));
    const chartEl = root.querySelector('[data-out="chart"]');
    if (chartEl) chartEl.innerHTML = chart(results, p.capacity, p.outage);
    const table = root.querySelector('[data-out="table"]');
    if (table) {
      table.innerHTML = results
        .map(
          (r) => `<tr data-strategy="${r.strategy}">
            <th scope="row"><span class="swatch sw-${r.strategy}" aria-hidden="true"></span>${LABEL[r.strategy]}</th>
            <td data-testid="backoff-${r.strategy}-attempts">${r.attempts}</td>
            <td data-testid="backoff-${r.strategy}-peak">${r.peak}</td>
            <td data-testid="backoff-${r.strategy}-settled">${r.settledAt.toFixed(1).replace('.', ',')} s</td>
            <td data-testid="backoff-${r.strategy}-gaveup">${r.gaveUp}</td>
            <td data-testid="backoff-${r.strategy}-pending">${r.pending}</td>
          </tr>`
        )
        .join('');
    }
    const [fixed, expo, jitter] = results;
    const insight = root.querySelector('[data-out="insight"]');
    const sec = (v: number) => `${v.toFixed(1).replace('.', ',')} s`;
    if (insight) {
      insight.innerHTML =
        `<li><strong>Intervalo fixo:</strong> os clientes voltam todos juntos. Depois da queda, o pico é de ${fixed.peak} tentativas em meio segundo ` +
        `(${(fixed.peak / (p.capacity * BUCKET)).toFixed(1).replace('.', ',')}× a capacidade) e ${fixed.gaveUp} clientes desistem.</li>` +
        `<li><strong>Exponencial sem jitter:</strong> as ondas ficam mais espaçadas, mas continuam sincronizadas (pico de ${expo.peak}). ` +
        `${expo.pending ? `No fim da simulação, ${expo.pending} clientes ainda estavam tentando.` : `Todos concluem em ${sec(expo.settledAt)}.`}</li>` +
        `<li><strong>Com jitter:</strong> cada cliente espera um tempo aleatório. O pico cai para ${jitter.peak}, ` +
        `${jitter.gaveUp ? `${jitter.gaveUp} desistem` : 'ninguém desiste'} e o último termina em ${sec(jitter.settledAt)}.</li>`;
    }
  };

  root.querySelector('[data-lab="run"]')?.addEventListener('click', run);
  root.querySelectorAll('input').forEach((el) => el.addEventListener('change', run));
  run();
}

export function initBackoffLab(): void {
  document.querySelectorAll<HTMLElement>('#backoff-lab').forEach(initLab);
}
