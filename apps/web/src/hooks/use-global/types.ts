export type Theme = 'light' | 'dark';

/** Everything the app remembers between visits. */
export type GlobalState = {
	theme: Theme;
	/** Whether the shell's rail is narrowed to its icons. */
	collapsed: boolean;
};

export type GlobalActions = {
	/** Merges a slice in, the way a `useState` setter would replace the whole. */
	set: (state: Partial<GlobalState>) => void;
	/** Back to the initial values, with a slice on top for what the caller means to keep. */
	reset: (state?: Partial<GlobalState>) => void;
};

export type GlobalStore = GlobalState & { actions: GlobalActions };
