import { describe, expect, it } from 'vitest';
import { emptySelection, parseEntityId, type EntityId, type EntityKind } from '@/data';
import { INITIAL_PRESENTER, presenterReducer } from './presenter';
import { SCENES } from './scenes';

describe('presenterReducer', () => {
  it('steps forward and back within bounds (Review Focus #4)', () => {
    let s = INITIAL_PRESENTER;
    s = presenterReducer(s, { type: 'prev' });
    expect(s.stepIdx).toBe(0);
    for (let i = 0; i < 10; i++) s = presenterReducer(s, { type: 'next', total: 3 });
    expect(s.stepIdx).toBe(2);
    s = presenterReducer(s, { type: 'prev' });
    expect(s.stepIdx).toBe(1);
  });

  it('toggles freeze and caption, and resets', () => {
    let s = presenterReducer(INITIAL_PRESENTER, { type: 'freeze' });
    s = presenterReducer(s, { type: 'toggleCaption' });
    expect(s).toMatchObject({ frozen: true, captionHidden: true });
    expect(presenterReducer(s, { type: 'reset' })).toEqual(INITIAL_PRESENTER);
  });
});

describe('SCENES', () => {
  it('has 5 scenes, each with captioned steps', () => {
    expect(SCENES).toHaveLength(5);
    for (const scene of SCENES) {
      expect(scene.steps.length).toBeGreaterThan(0);
      for (const step of scene.steps) expect(step.captionSi.trim()).not.toBe('');
    }
  });

  it('only references valid entity ids', () => {
    for (const scene of SCENES)
      for (const step of scene.steps)
        for (const [kind, ids] of Object.entries({ ...emptySelection(), ...step.select }))
          for (const id of ids as EntityId[])
            expect(parseEntityId(kind as EntityKind, String(id)), `${scene.id}: ${kind}=${id}`).not.toBeNull();
  });
});
