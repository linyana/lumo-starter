import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { GlobalState, GlobalStore } from './types';

export type { GlobalActions, GlobalState, GlobalStore, Theme } from './types';

const initial: GlobalState = {
	theme: 'light',
	collapsed: false,
};

const stored = ({ theme, collapsed }: Partial<GlobalState>): GlobalState => ({
	theme: theme === 'dark' ? 'dark' : initial.theme,
	collapsed: typeof collapsed === 'boolean' ? collapsed : initial.collapsed,
});

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
