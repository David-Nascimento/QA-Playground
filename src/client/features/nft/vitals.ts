// ========================================
// Web Vitals reais da própria página (PerformanceObserver)
// ----------------------------------------
// Ativado em #nft-vitals. Mede TTFB, FCP, LCP, CLS, INP (aproximado) e
// tarefas longas, com as faixas oficiais (web.dev): bom / precisa
// melhorar / ruim. O botão de "tarefa longa" bloqueia a thread principal
// de propósito para o aluno ver o INP piorar.
// ========================================

type Rating = 'good' | 'needs' | 'poor' | 'none';

interface MetricDef {
  key: string;
  good: number;
  poor: number;
  unit: 'ms' | '';
}

const METRICS: MetricDef[] = [
  { key: 'ttfb', good: 800, poor: 1800, unit: 'ms' },
  { key: 'fcp', good: 1800, poor: 3000, unit: 'ms' },
  { key: 'lcp', good: 2500, poor: 4000, unit: 'ms' },
  { key: 'cls', good: 0.1, poor: 0.25, unit: '' },
  { key: 'inp', good: 200, poor: 500, unit: 'ms' },
  { key: 'tbt', good: 200, poor: 600, unit: 'ms' },
];

const RATING_LABEL: Record<Rating, string> = { good: 'Bom', needs: 'Precisa melhorar', poor: 'Ruim', none: 'Aguardando' };

const rate = (m: MetricDef, v: number | null): Rating =>
  v === null ? 'none' : v <= m.good ? 'good' : v <= m.poor ? 'needs' : 'poor';

const fmt = (m: MetricDef, v: number | null) =>
  v === null ? '—' : m.unit === 'ms' ? (v >= 1000 ? `${(v / 1000).toFixed(2).replace('.', ',')} s` : `${Math.round(v)} ms`) : v.toFixed(3).replace('.', ',');

function observe(type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}): void {
  try {
    const po = new PerformanceObserver((list) => cb(list.getEntries()));
    po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
  } catch {
    /* tipo não suportado neste navegador */
  }
}

export function initVitals(): void {
  const root = document.getElementById('nft-vitals');
  if (!root) return;

  const values: Record<string, number | null> = { ttfb: null, fcp: null, lcp: null, cls: null, inp: null, tbt: null };
  let longTasks = 0;

  const render = () => {
    METRICS.forEach((m) => {
      const card = root.querySelector<HTMLElement>(`[data-metric="${m.key}"]`);
      if (!card) return;
      const r = rate(m, values[m.key]);
      card.dataset.rating = r;
      const v = card.querySelector('[data-value]');
      const label = card.querySelector('[data-rating-label]');
      if (v) v.textContent = fmt(m, values[m.key]);
      if (label) label.textContent = RATING_LABEL[r];
    });
    const lt = root.querySelector('[data-out="longtasks"]');
    if (lt) lt.textContent = String(longTasks);
  };

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav) values.ttfb = nav.responseStart - ((nav as PerformanceNavigationTiming & { activationStart?: number }).activationStart || 0);

  observe('paint', (entries) => {
    entries.forEach((e) => {
      if (e.name === 'first-contentful-paint') values.fcp = e.startTime;
    });
    render();
  });

  observe('largest-contentful-paint', (entries) => {
    const last = entries[entries.length - 1];
    if (last) values.lcp = last.startTime;
    render();
  });

  // CLS: soma das mudanças de layout em "janelas de sessão" (simplificado)
  let clsSession = 0;
  let clsMax = 0;
  let lastShift = 0;
  observe('layout-shift', (entries) => {
    entries.forEach((e) => {
      const shift = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (shift.hadRecentInput) return;
      clsSession = e.startTime - lastShift < 1000 ? clsSession + shift.value : shift.value;
      lastShift = e.startTime;
      clsMax = Math.max(clsMax, clsSession);
    });
    values.cls = clsMax;
    render();
  });
  if (values.cls === null) values.cls = 0;

  // INP aproximado: a interação mais lenta observada (o INP oficial usa ~p98)
  observe(
    'event',
    (entries) => {
      entries.forEach((e) => {
        const ev = e as PerformanceEntry & { interactionId?: number };
        if (ev.interactionId) values.inp = Math.max(values.inp ?? 0, e.duration);
      });
      render();
    },
    { durationThreshold: 16 }
  );

  // Tarefas longas (> 50 ms) e tempo de bloqueio total
  observe('longtask', (entries) => {
    entries.forEach((e) => {
      longTasks++;
      values.tbt = (values.tbt ?? 0) + Math.max(0, e.duration - 50);
    });
    render();
  });
  if (values.tbt === null) values.tbt = 0;

  root.querySelector('[data-action="long-task"]')?.addEventListener('click', (e) => {
    const ms = Number((e.currentTarget as HTMLElement).dataset.duration || 300);
    const end = performance.now() + ms;
    while (performance.now() < end) {
      /* bloqueia a thread principal de propósito */
    }
    const out = root.querySelector('[data-out="last-task"]');
    if (out) out.textContent = `A página ficou ${ms} ms sem responder. Veja o INP e o tempo de bloqueio.`;
  });

  root.querySelector('[data-action="layout-shift"]')?.addEventListener('click', () => {
    // Insere um banner sem reservar espaço. O atraso de 600 ms fica fora da
    // janela de 500 ms após a interação, então a mudança conta no CLS, como
    // um anúncio que aparece depois que a página já carregou.
    const target = root.querySelector<HTMLElement>('[data-out="shift-demo"]');
    if (!target) return;
    window.setTimeout(() => {
      target.hidden = !target.hidden;
    }, 600);
  });

  render();
}
