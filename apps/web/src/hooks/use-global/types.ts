export type Theme = 'light' | 'dark';

export type GlobalState = {
	theme: Theme;
	collapsed: boolean;
};

export type GlobalActions = {
	set: (state: Partial<GlobalState> | ((state: GlobalState) => Partial<GlobalState>)) => void;
	reset: (state?: Partial<GlobalState>) => void;
};

export type GlobalStore = GlobalState & { actions: GlobalActions };
