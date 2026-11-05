import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { initial, snapshotSchema } from './schema';
import type { GlobalState, GlobalStore } from './types';

export type { GlobalActions, GlobalState, GlobalStore, Theme } from './types';

/**
 * Whatever storage holds, this is the state: every field falls back to its default, and keys the
 * store does not declare are dropped. Both ends of `persist` go through it — `partialize` writes
 * with it, `merge` reads with it — so a snapshot that carried `actions: {}` cannot replace the live
 * methods, a field that is present but wrong cannot arrive, and neither can a field that has since
 * been removed. Storage is an input, not the state.
 */
const stored = (snapshot: unknown): GlobalState => snapshotSchema.parse(snapshot);

/**
 * What the app remembers between visits: the theme and the rail's width. Data only — the store
 * never touches the document, so importing it (a test, an interceptor) has no side effect. `.dark`
 * on <html> is decided by `theme` and applied in `providers/theme`, which is the one place that
 * keeps the two in step.
 *
 *   const { theme, actions } = useGlobal();
 *   actions.set({ theme: 'dark' });
 */
export const useGlobal = create<GlobalStore>()(
	persist(
		(set) => ({
			...initial,

			actions: {
				set,
				reset: (state) => set({ ...initial, ...state }),
			},
		}),
		{
			// `index.html` reads this key before the first paint, so a dark reload never flashes
			// light: change the key or the shape here and there together.
			name: 'lumo',
			partialize: stored,
			merge: (persisted, current) => ({ ...current, ...stored(persisted) }),
		} satisfies PersistOptions<GlobalStore, GlobalState>,
	),
);
