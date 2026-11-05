import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { GlobalState, GlobalStore } from './types';

export type { GlobalActions, GlobalState, GlobalStore } from './types';

/** What a first visit starts from: the rail open. */
const initial: GlobalState = {
	collapsed: false,
};

/**
 * The only shape a snapshot may contribute, field by field and with the default as the floor. Both
 * ends of `persist` go through it: `partialize` decides what is written, `merge` decides what may be
 * read back — so a stale snapshot that also carried `actions: {}` cannot replace the live methods,
 * and a field the store has since dropped cannot return. Storage is an input, not the state.
 */
const stored = ({ collapsed }: Partial<GlobalState>): GlobalState => ({
	collapsed: collapsed ?? initial.collapsed,
});

/**
 * What belongs to the app rather than to a screen, and to no external system either: the rail's
 * width. That is the whole reason this is a store and not a context — a field can be read without a
 * provider above it. The theme is the opposite case and lives in `providers/theme`.
 *
 *   const { collapsed, actions } = useGlobal();
 *   actions.set({ collapsed: true });
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
			name: 'lumo',
			partialize: stored,
			merge: (persisted, current) => ({
				...current,
				...stored(persisted as Partial<GlobalState>),
			}),
		} satisfies PersistOptions<GlobalStore, GlobalState>,
	),
);
