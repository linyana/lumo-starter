import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
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
	const [overrides, setOverrides] = useState<TokenOverrides>(empty);

	const set = useCallback(
		({ name, value }: { name: string; value: string }) => {
			const trimmed = value.trim();
			if (unsafe.test(trimmed)) return;

			setOverrides((current) => {
				const map = { ...current[resolved] };
				if (trimmed === '') delete map[name];
				else map[name] = trimmed;
				return { ...current, [resolved]: map };
			});
		},
		[resolved],
	);

	const reset = useCallback(() => setOverrides(empty), []);

	const value = useMemo<TokenEditor>(() => {
		const current = overrides[resolved];

		return {
			theme: resolved,
			overrides,
			count: Object.keys(overrides.light).length + Object.keys(overrides.dark).length,
			set,
			reset,
			overridden: (name) => current[editTargetOf(name)] !== undefined,
			valueOf: (name) => {
				const target = editTargetOf(name);
				const override = current[target];
				if (override !== undefined) return override;

				const token = tokenNamed(target) ?? tokenNamed(name);
				return token === undefined ? '' : valueOf({ token, theme: resolved });
			},
		};
	}, [overrides, reset, resolved, set]);

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
