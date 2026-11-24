export const themes = ['light', 'dark', 'system'] as const;

export type Theme = (typeof themes)[number];

export type ResolvedTheme = Exclude<Theme, 'system'>;

export const isTheme = (value: unknown): value is Theme =>
	typeof value === 'string' && (themes as readonly string[]).includes(value);

export type GlobalState = {
	theme: Theme;
	collapsed: boolean;
};

export type GlobalActions = {
	set: (state: Partial<GlobalState> | ((state: GlobalState) => Partial<GlobalState>)) => void;
	reset: (state?: Partial<GlobalState>) => void;
};

export type GlobalStore = GlobalState & { actions: GlobalActions };
