'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { emptySelection } from '@/data';
import { useSelection } from '@/state/selection';
import { ExplorerView } from '@/views/explorer/ExplorerView';
import { GraphView } from '@/views/graph/GraphView';
import { INITIAL_PRESENTER, presenterReducer } from './presenter';
import { SCENES } from './scenes';

const NEXT_KEYS = ['ArrowRight', 'PageDown', ' '];
const PREV_KEYS = ['ArrowLeft', 'PageUp'];

export function PresentView() {
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [state, dispatch] = useReducer(presenterReducer, INITIAL_PRESENTER);
  const setSelection = useSelection((s) => s.set);
  const scene = SCENES.find((s) => s.id === sceneId) ?? null;
  const step = scene?.steps[state.stepIdx];
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    if (step) setSelection({ ...emptySelection(), ...step.select });
  }, [step, setSelection]);

  // ExplorerView/GraphView only need to remount when the step's view type changes — their
  // own content (highlighting etc.) already updates via the useSelection store subscription.
  // Memoizing avoids re-rendering the (heavy, 89-tile) ExplorerView tree on every unrelated
  // PresentView state change (freeze/caption toggles, boundary no-op next/prev).
  const content = useMemo(
    () => (step?.view === 'graph' ? <GraphView /> : <ExplorerView presenting />),
    [step?.view],
  );

  const exit = useCallback(() => {
    setSceneId(null);
    dispatch({ type: 'reset' });
    if (document.fullscreenElement) document.exitFullscreen()?.catch(() => {});
  }, []);

  useEffect(() => {
    if (!scene) return;
    const total = scene.steps.length;
    const onKey = (e: KeyboardEvent) => {
      if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault();
        dispatch({ type: 'next', total });
      } else if (PREV_KEYS.includes(e.key)) {
        e.preventDefault();
        dispatch({ type: 'prev' });
      } else if (e.key === 'Escape') {
        exit();
      } else if (e.key === 'f' || e.key === 'F') {
        dispatch({ type: 'freeze' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene, exit]);

  const start = (id: string) => {
    dispatch({ type: 'reset' });
    setSceneId(id);
    document.documentElement.requestFullscreen?.()?.catch(() => {});
  };

  if (!scene || !step) {
    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <h2 className="font-display text-3xl font-bold">ඉදිරිපත් කිරීම් දර්ශන</h2>
        <p className="text-muted">යතුරු: → ඊළඟ · ← පෙර · Esc පිටවීම · F නිශ්චල කිරීම · ජංගම: ස්වයිප් කරන්න</p>
        <ul className="space-y-2">
          {SCENES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => start(s.id)}
                className="flex min-h-14 w-full items-center justify-between rounded-lg border border-line bg-surface px-4 text-left text-lg hover:bg-hover"
              >
                <span>{s.titleSi}</span>
                <span className="text-sm text-muted">පියවර {s.steps.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const total = scene.steps.length;
  return (
    <div
      data-testid="presenter"
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') swipeStart.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (dx < -60) dispatch({ type: 'next', total });
        else if (dx > 60) dispatch({ type: 'prev' });
      }}
    >
      <div className="relative min-h-0 flex-1 overflow-auto p-4">
        {content}
        {state.frozen && <div data-testid="freeze-overlay" className="absolute inset-0 z-10" aria-hidden />}
      </div>
      <footer className="border-t border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex-1 text-left"
            aria-label="විස්තරය සඟවන්න / පෙන්වන්න"
            onClick={() => dispatch({ type: 'toggleCaption' })}
          >
            <p data-testid="caption" className={`font-display text-2xl md:text-4xl ${state.captionHidden ? 'invisible' : ''}`}>
              {step.captionSi}
            </p>
          </button>
          {state.frozen && <span aria-label="නිශ්චල කර ඇත">❄</span>}
          <span className="tabular-nums text-muted">
            {state.stepIdx + 1} / {total}
          </span>
        </div>
      </footer>
    </div>
  );
}
