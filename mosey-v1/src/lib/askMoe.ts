import { router } from 'expo-router';

import { useStore } from './store';

/** Where on screen Moe is, so the chat panel can grow out of him. */
export type Anchor = { x: number; y: number; size: number };

type LiveMoe = {
  react: () => void;
  measure: (done: (anchor: Anchor | null) => void) => void;
};

let current: LiveMoe | null = null;

/** Called by the tappable Moe on the focused screen. Returns an unregister function. */
export function registerMoe(moe: LiveMoe) {
  current = moe;
  return () => {
    if (current === moe) current = null;
  };
}

/**
 * Open the chat panel from wherever Moe currently is.
 * `prompt` sends a first message; `policyId` starts a chat about that policy;
 * with `insightId` too, the chat opens with that insight in view.
 */
export function askMoe(opts: { prompt?: string; policyId?: string; insightId?: string } = {}) {
  const store = useStore.getState();
  if (opts.policyId && opts.insightId) store.startInsightChat(opts.policyId, opts.insightId);
  else if (opts.policyId) store.startChat(opts.policyId);
  else store.openChat(null);
  if (opts.prompt) store.send(opts.prompt);

  const moe = current;
  // No Moe on this screen to grow a panel out of: go to his tab instead.
  if (!moe) return router.navigate('/moe');
  moe.react();
  // Let his little squish start before the panel covers him.
  moe.measure((anchor) => setTimeout(() => useStore.getState().openPanel(anchor), 140));
}
