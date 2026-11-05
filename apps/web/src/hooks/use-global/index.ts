import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GlobalState, GlobalStore, Theme } from './types';

export type { GlobalActions, GlobalState, GlobalStore, Theme } from './types';

/** What a first visit starts from: light, and an open rail. */
const initial: GlobalState = {
	theme: 'light',
	collapsed: false,
};

/**
 * `.dark` on <html> is how the stylesheet picks its token block — see
 * `@custom-variant dark` in `index.css`. `colorScheme` carries the choice to the native
 * chrome: scrollbars and form controls would otherwise follow the operating system instead.
 */
const applyTheme = (theme: Theme) => {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.style.colorScheme = theme;
};

/**
 * What belongs to the app rather than to a screen: the theme and the rail's width. A store rather
 * than a context, so a screen re-renders for the field it reads and a component outside the tree —
 * an http interceptor, say — can reach it too.
 *
 *   const { theme, actions } = useGlobal();
 *   actions.set({ theme: 'light' });
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
		// The whole store is worth remembering, so nothing is filtered out: `actions` is made of
		// functions, which `JSON.stringify` drops on the way to storage. `index.html` reads this
		// key before the first paint, so a dark reload never flashes light.
		{ name: 'lumo' },
	),
);

// There is no provider to run this from, and a reload has to land on the stored theme before
// React's first render: apply it as the store is created, then on every change of the one field
// that decides it.
applyTheme(useGlobal.getState().theme);
useGlobal.subscribe((state, previous) => {
	if (state.theme !== previous.theme) applyTheme(state.theme);
});
