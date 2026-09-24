export interface PresenterState {
  stepIdx: number;
  frozen: boolean;
  captionHidden: boolean;
}

export type PresenterAction =
  | { type: 'next'; total: number }
  | { type: 'prev' }
  | { type: 'freeze' }
  | { type: 'toggleCaption' }
  | { type: 'reset' };

export const INITIAL_PRESENTER: PresenterState = { stepIdx: 0, frozen: false, captionHidden: false };

export function presenterReducer(state: PresenterState, action: PresenterAction): PresenterState {
  switch (action.type) {
    case 'next':
      return { ...state, stepIdx: Math.max(0, Math.min(state.stepIdx + 1, action.total - 1)) };
    case 'prev':
      return { ...state, stepIdx: Math.max(0, state.stepIdx - 1) };
    case 'freeze':
      return { ...state, frozen: !state.frozen };
    case 'toggleCaption':
      return { ...state, captionHidden: !state.captionHidden };
    case 'reset':
      return INITIAL_PRESENTER;
  }
}
