import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
	type ReactNode,
} from 'react';
import { useTheme } from '@/providers/theme';
import { editTargetOf, tokenNamed, valueOf } from './model';

type Theme = 'light' | 'dark';

type TokenOverrides = Record<Theme, Record<string, string>>;

export type TokenEditor = {
	theme: Theme;
	overrides: TokenOverrides;
	count: number;
	set: (input: { name: string; value: string }) => void;
	reset: () => void;
	valueOf: (name: string) => string;
	overridden: (name: string) => boolean;
};

const unsafe = /[{};]/;
const empty: TokenOverrides = { light: {}, dark: {} };

let store: TokenOverrides = empty;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

const getSnapshot = (): TokenOverrides => store;

const emit = (): void => {
	for (const listener of listeners) listener();
};

const write = ({ name, value, theme }: { name: string; value: string; theme: Theme }): void => {
	const trimmed = value.trim();
	if (unsafe.test(trimmed)) return;

	const map = { ...store[theme] };
	if (trimmed === '') delete map[name];
	else map[name] = trimmed;

	store = { ...store, [theme]: map };
	emit();
};

const clear = (): void => {
	store = empty;
	emit();
};

const block = (map: Record<string, string>): string =>
	Object.entries(map)
		.map(([name, value]) => `${name}: ${value};`)
		.join('');

const Style = ({ overrides }: { overrides: TokenOverrides }) => (
	<style data-design-overrides>{`:root:not(.dark){${block(overrides.light)}}.dark{${block(
		overrides.dark,
	)}}`}</style>
);

const TokenEditorContext = createContext<TokenEditor | null>(null);

export const TokenEditorProvider = ({ children }: { children: ReactNode }) => {
	const { resolved } = useTheme();
	const overrides = useSyncExternalStore(subscribe, getSnapshot);

	const set = useCallback(
		(input: { name: string; value: string }) => write({ ...input, theme: resolved }),
		[resolved],
	);

	const value = useMemo<TokenEditor>(() => {
		const current = overrides[resolved];

		return {
			theme: resolved,
			overrides,
			count: Object.keys(overrides.light).length + Object.keys(overrides.dark).length,
			set,
			reset: clear,
			overridden: (name) => current[editTargetOf(name)] !== undefined,
			valueOf: (name) => {
				const target = editTargetOf(name);
				const override = current[target];
				if (override !== undefined) return override;

				const token = tokenNamed(target) ?? tokenNamed(name);
				return token === undefined ? '' : valueOf({ token, theme: resolved });
			},
		};
	}, [overrides, resolved, set]);

	return (
		<TokenEditorContext.Provider value={value}>
			<Style overrides={overrides} />
			{children}
		</TokenEditorContext.Provider>
	);
};

export const useTokenEditor = (): TokenEditor => {
	const context = useContext(TokenEditorContext);
	if (context === null) throw new Error('useTokenEditor must be used inside <TokenEditorProvider>');
	return context;
};
