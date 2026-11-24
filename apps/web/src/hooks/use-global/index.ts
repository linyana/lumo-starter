import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { isTheme, type GlobalState, type GlobalStore, type Theme } from './types';

export * from './types';

export const defaultTheme: Theme = 'system';

const initial: GlobalState = {
	theme: defaultTheme,
	collapsed: false,
};

const asRecord = (value: unknown): Record<string, unknown> =>
	typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const stored = (state: unknown): GlobalState => {
	const persisted = asRecord(state);

	return {
		theme: isTheme(persisted.theme) ? persisted.theme : initial.theme,
		collapsed: typeof persisted.collapsed === 'boolean' ? persisted.collapsed : initial.collapsed,
	};
};

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
				...stored(persisted),
			}),
		} satisfies PersistOptions<GlobalStore, GlobalState>,
	),
);
