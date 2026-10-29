// ========================================
// Mobile - laboratório de gestos (Pointer Events)
// ----------------------------------------
// Ativado em #gesture-lab. Reconhece toque, toque duplo, toque longo,
// arrasto, swipe e pinça a partir de Pointer Events, que funcionam com
// dedo, mouse e caneta. Os limites (tempo do toque longo, distância do
// swipe, janela do toque duplo) são configuráveis para o aluno ver como
// cada decisão de produto muda o comportamento.
//
// Saídas com data-testid para automação: gesture-last, gesture-pointer,
// gesture-distance, gesture-duration, gesture-velocity, gesture-scale.
// ========================================

export type Gesture = 'toque' | 'toque duplo' | 'toque longo' | 'arrasto' | 'swipe' | 'pinça';

export interface GestureThresholds {
  /** ms segurando para virar toque longo */
  longPress: number;
  /** px mínimos para contar como movimento */
  moveTolerance: number;
  /** px mínimos para um swipe */
  swipeDistance: number;
  /** px/ms mínimos para um swipe (abaixo disso é arrasto) */
  swipeVelocity: number;
  /** ms entre toques para virar toque duplo */
  doubleTap: number;
}

export const DEFAULT_THRESHOLDS: GestureThresholds = {
  longPress: 500,
  moveTolerance: 10,
  swipeDistance: 30,
  swipeVelocity: 0.3,
  doubleTap: 300,
};

export interface Stroke {
  dx: number;
  dy: number;
  duration: number;
}

/** Classifica um traço de um dedo (função pura, testável). */
export function classifyStroke(s: Stroke, t: GestureThresholds): { gesture: Gesture; direction: string | null; velocity: number } {
  const distance = Math.hypot(s.dx, s.dy);
  const velocity = s.duration > 0 ? distance / s.duration : 0;
  if (distance < t.moveTolerance) {
    return { gesture: s.duration >= t.longPress ? 'toque longo' : 'toque', direction: null, velocity };
  }
  const direction =
    Math.abs(s.dx) >= Math.abs(s.dy) ? (s.dx > 0 ? 'direita' : 'esquerda') : s.dy > 0 ? 'baixo' : 'cima';
  const isSwipe = distance >= t.swipeDistance && velocity >= t.swipeVelocity;
  return { gesture: isSwipe ? 'swipe' : 'arrasto', direction, velocity };
}

interface Active {
  x0: number;
  y0: number;
  x: number;
  y: number;
  t0: number;
}

const POINTER_LABEL: Record<string, string> = { touch: 'dedo (touch)', mouse: 'mouse', pen: 'caneta' };

export function initGestureLab(): void {
  const root = document.getElementById('gesture-lab');
  const pad = root?.querySelector<HTMLElement>('[data-gesture-pad]');
  if (!root || !pad) return;

  const out = (key: string, text: string) => {
    const el = root.querySelector(`[data-out="${key}"]`);
    if (el) el.textContent = text;
  };
  const read = (key: keyof GestureThresholds) => {
    const v = Number(root.querySelector<HTMLInputElement>(`[data-lab="${key}"]`)?.value);
    return Number.isFinite(v) && v > 0 ? v : DEFAULT_THRESHOLDS[key];
  };
  const thresholds = (): GestureThresholds => ({
    longPress: read('longPress'),
    moveTolerance: DEFAULT_THRESHOLDS.moveTolerance,
    swipeDistance: read('swipeDistance'),
    swipeVelocity: DEFAULT_THRESHOLDS.swipeVelocity,
    doubleTap: read('doubleTap'),
  });

  const log = root.querySelector<HTMLOListElement>('[data-out="log"]');
  const indicator = pad.querySelector<HTMLElement>('[data-gesture-indicator]');
  const active = new Map<number, Active>();
  let pinchStart = 0;
  let multiTouch = false; // houve 2+ dedos neste gesto
  let pinchRecorded = false;
  let lastTap = { at: 0, x: 0, y: 0 };
  let longTimer = 0;
  let count = 0;

  const record = (gesture: Gesture, detail: string) => {
    count++;
    out('gesture', gesture);
    pad.dataset.gesture = gesture;
    if (indicator) {
      indicator.textContent = gesture;
      indicator.classList.remove('is-pop');
      void indicator.offsetWidth; // reinicia a animação
      indicator.classList.add('is-pop');
    }
    if (log) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${gesture}</strong> <span>${detail}</span>`;
      log.prepend(li);
      while (log.children.length > 8) log.lastElementChild?.remove();
    }
    out('count', String(count));
  };

  const pinchDistance = () => {
    const [a, b] = [...active.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  pad.addEventListener('pointerdown', (e) => {
    pad.setPointerCapture(e.pointerId);
    active.set(e.pointerId, { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now() });
    out('pointer', POINTER_LABEL[e.pointerType] ?? e.pointerType);
    out('points', String(active.size));
    if (active.size >= 2) multiTouch = true;
    if (active.size === 2) pinchStart = pinchDistance();

    // toque longo é anunciado enquanto o dedo ainda está parado
    window.clearTimeout(longTimer);
    if (active.size === 1) {
      const id = e.pointerId;
      longTimer = window.setTimeout(() => {
        const p = active.get(id);
        if (p && Math.hypot(p.x - p.x0, p.y - p.y0) < DEFAULT_THRESHOLDS.moveTolerance) {
          pad.dataset.holding = 'true';
        }
      }, thresholds().longPress);
    }
  });

  pad.addEventListener('pointermove', (e) => {
    const p = active.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (active.size === 2 && pinchStart > 0) {
      out('scale', `${(pinchDistance() / pinchStart).toFixed(2).replace('.', ',')}×`);
    }
  });

  const finish = (e: PointerEvent, cancelled: boolean) => {
    const p = active.get(e.pointerId);
    if (!p) return;
    const wasPinch = active.size === 2 && !pinchRecorded;
    const scale = wasPinch && pinchStart > 0 ? pinchDistance() / pinchStart : 1;
    active.delete(e.pointerId);
    out('points', String(active.size));
    window.clearTimeout(longTimer);
    delete pad.dataset.holding;

    if (cancelled) {
      record('arrasto', 'cancelado pelo navegador (pointercancel): verifique touch-action');
      return;
    }
    if (wasPinch) {
      pinchRecorded = true;
      pinchStart = 0;
      out('scale', `${scale.toFixed(2).replace('.', ',')}×`);
      record('pinça', scale >= 1 ? `afastou os dedos (zoom +), escala ${scale.toFixed(2)}` : `aproximou os dedos (zoom −), escala ${scale.toFixed(2)}`);
      return;
    }
    if (active.size > 0) return; // ainda há dedos na tela
    if (multiTouch) {
      // o último dedo de uma pinça não é um swipe
      multiTouch = false;
      pinchRecorded = false;
      return;
    }

    const duration = performance.now() - p.t0;
    const dx = p.x - p.x0;
    const dy = p.y - p.y0;
    const t = thresholds();
    const r = classifyStroke({ dx, dy, duration }, t);
    out('distance', `${Math.round(Math.hypot(dx, dy))} px`);
    out('duration', `${Math.round(duration)} ms`);
    out('velocity', `${r.velocity.toFixed(2).replace('.', ',')} px/ms`);
    out('direction', r.direction ?? '—');

    if (r.gesture === 'toque') {
      const now = performance.now();
      const near = Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30;
      const gap = now - lastTap.at;
      if (gap <= t.doubleTap && near) {
        lastTap.at = 0; // um terceiro toque começa uma nova contagem
        record('toque duplo', `dois toques com ${Math.round(gap)} ms de intervalo (limite: ${t.doubleTap} ms)`);
        return;
      }
      lastTap = { at: now, x: p.x, y: p.y };
      record('toque', `${Math.round(duration)} ms parado`);
      return;
    }
    if (r.gesture === 'toque longo') {
      record('toque longo', `${Math.round(duration)} ms (limite: ${t.longPress} ms)`);
      return;
    }
    record(r.gesture, `para ${r.direction}, ${Math.round(Math.hypot(dx, dy))} px a ${r.velocity.toFixed(2)} px/ms`);
  };

  pad.addEventListener('pointerup', (e) => finish(e, false));
  pad.addEventListener('pointercancel', (e) => finish(e, true));

  root.querySelector('[data-lab="clear"]')?.addEventListener('click', () => {
    count = 0;
    if (log) log.innerHTML = '';
    ['gesture', 'distance', 'duration', 'velocity', 'direction', 'scale'].forEach((k) => out(k, '—'));
    out('count', '0');
    delete pad.dataset.gesture;
    if (indicator) indicator.textContent = 'Toque, segure, arraste ou deslize aqui';
  });

  // Modo de touch-action: mostra por que o navegador "rouba" o gesto
  root.querySelector<HTMLSelectElement>('[data-lab="touchAction"]')?.addEventListener('change', (e) => {
    pad.style.touchAction = (e.target as HTMLSelectElement).value;
    out('touch-action', pad.style.touchAction);
  });
}
