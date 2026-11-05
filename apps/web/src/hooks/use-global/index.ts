import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { GlobalState, GlobalStore } from './types';

export type { GlobalActions, GlobalState, GlobalStore, Theme } from './types';

/** What a first visit starts from: light, and an open rail. */
const initial: GlobalState = {
	theme: 'light',
	collapsed: false,
};

/**
 * The only shape a snapshot may contribute, field by field and with the default as the floor. Both
 * ends of `persist` go through it: `partialize` decides what is written, `merge` decides what may be
 * read back — so a stale snapshot that also carried `actions: {}` cannot replace the live methods,
 * and a field the store has since dropped cannot return. Storage is an input, not the state.
 */
const stored = ({ theme, collapsed }: Partial<GlobalState>): GlobalState => ({
	theme: theme ?? initial.theme,
	collapsed: collapsed ?? initial.collapsed,
});

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
			merge: (persisted, current) => ({
				...current,
				...stored(persisted as Partial<GlobalState>),
			}),
		} satisfies PersistOptions<GlobalStore, GlobalState>,
	),
);
