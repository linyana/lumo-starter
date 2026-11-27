import styles from '@/styles/index.css?raw';

export type DesignToken = {
	name: string;
	light?: string;
	dark?: string;
	isMap: boolean;
};

export type TokenGroup = {
	key: string;
	label: string;
	note?: string;
	swatch: boolean;
	tokens: DesignToken[];
};

type GroupSpec = Omit<TokenGroup, 'tokens'> & { match?: (name: string) => boolean };

const COLOR_NAME =
	/(^--layout-|foreground|background|border|input|ring|overlay|primary|secondary|muted|accent|destructive|success|warning|info|highlight|skeleton)/;

const GROUPS: GroupSpec[] = [
	{
		key: 'theme',
		label: 'Tailwind mapping',
		note: 'Aliases from `@theme inline`: `bg-card` compiles to `var(--card)`, so these names do not exist at runtime and editing them changes nothing.',
		swatch: true,
		match: (name) => name.startsWith('--color-'),
	},
	{
		key: 'radius',
		label: 'Radius',
		note: '`--radius` is the base; `--radius-sm/md/lg` are already computed at build time.',
		swatch: false,
		match: (name) => name === '--radius' || name.startsWith('--radius-'),
	},
	{
		key: 'shadow',
		label: 'Shadow',
		swatch: false,
		match: (name) => name.startsWith('--shadow-'),
	},
	{
		key: 'motion',
		label: 'Motion',
		note: 'Collapsed to 1ms under `prefers-reduced-motion`.',
		swatch: false,
		match: (name) =>
			name.startsWith('--duration-') || name.startsWith('--ease-') || name.startsWith('--animate-'),
	},
	{
		key: 'interaction',
		label: 'Interaction',
		note: 'State layer opacities and press offsets; components use them for hover and pressed.',
		swatch: false,
		match: (name) =>
			name.startsWith('--state-layer-') ||
			name.startsWith('--press-') ||
			name.startsWith('--shift-') ||
			name.startsWith('--blur-'),
	},
	{
		key: 'type',
		label: 'Typography',
		swatch: false,
		match: (name) => name.startsWith('--font-'),
	},
	{ key: 'color', label: 'Color', swatch: true, match: (name) => COLOR_NAME.test(name) },
	{ key: 'misc', label: 'Other', swatch: false },
];

const FALLBACK: GroupSpec = { key: 'misc', label: 'Other', swatch: false };

const specFor = (name: string): GroupSpec =>
	GROUPS.find((spec) => spec.match?.(name) === true) ?? FALLBACK;

const blockOf = (header: string): string => {
	const start = styles.indexOf(`${header} {`);
	if (start < 0) return '';

	let depth = 0;
	for (let index = start + header.length; index < styles.length; index += 1) {
		const char = styles[index];
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) return styles.slice(start, index + 1);
		}
	}

	return '';
};

const declarationsIn = (block: string): Map<string, string> => {
	const found = new Map<string, string>();

	for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
		if (name === undefined || value === undefined) continue;
		found.set(name, value.replace(/\s+/g, ' ').trim());
	}

	return found;
};

const themeMap = declarationsIn(blockOf('@theme inline'));
const rootMap = declarationsIn(blockOf(':root'));
const darkMap = declarationsIn(blockOf('.dark'));

export const tokenGroups = (): TokenGroup[] => {
	const names = [...new Set([...themeMap.keys(), ...rootMap.keys(), ...darkMap.keys()])].sort(
		(a, b) => a.localeCompare(b),
	);
	const buckets = new Map<string, DesignToken[]>();

	for (const name of names) {
		const { key } = specFor(name);
		const bucket = buckets.get(key) ?? [];
		bucket.push({
			name,
			light: rootMap.get(name) ?? themeMap.get(name),
			dark: darkMap.get(name),
			isMap: !rootMap.has(name) && !darkMap.has(name),
		});
		buckets.set(key, bucket);
	}

	return GROUPS.flatMap((spec) => {
		const tokens = buckets.get(spec.key);
		if (tokens === undefined || tokens.length === 0) return [];
		const { match: _match, ...rest } = spec;
		return [{ ...rest, tokens }];
	});
};

export const tokenNamed = (name: string): DesignToken | undefined => {
	if (!rootMap.has(name) && !darkMap.has(name) && !themeMap.has(name)) return undefined;

	return {
		name,
		light: rootMap.get(name) ?? themeMap.get(name),
		dark: darkMap.get(name),
		isMap: !rootMap.has(name) && !darkMap.has(name),
	};
};

export const valueOf = ({
	token,
	theme,
}: {
	token: DesignToken;
	theme: 'light' | 'dark';
}): string => (theme === 'dark' ? (token.dark ?? token.light) : (token.light ?? token.dark)) ?? '';

export const inheritedFromLight = ({
	token,
	theme,
}: {
	token: DesignToken;
	theme: 'light' | 'dark';
}): boolean => theme === 'dark' && token.dark === undefined && token.light !== undefined;

const declaredValue = (name: string): string =>
	rootMap.get(name) ?? darkMap.get(name) ?? themeMap.get(name) ?? '';

const varReference = (name: string): string | null => {
	for (const [, target] of declaredValue(name).matchAll(/var\(\s*(--[\w-]+)/g)) {
		if (target !== undefined && target !== name) return target;
	}
	return null;
};

let live: Set<string> | null = null;

export const liveTokens = (): Set<string> => {
	if (live !== null) return live;

	const found = new Set<string>();

	for (const sheet of document.styleSheets) {
		let rules: CSSRuleList;
		try {
			rules = sheet.cssRules;
		} catch {
			continue;
		}

		for (const rule of rules) {
			for (const [, name] of rule.cssText.matchAll(/var\(\s*(--[\w-]+)/g)) {
				if (name !== undefined) found.add(name);
			}
		}
	}

	live = found;
	return live;
};

export const isLive = (name: string): boolean => {
	const found = liveTokens();
	return found.size === 0 || found.has(name);
};

export const editTargetOf = (name: string): string => {
	if (isLive(name)) return name;

	const target = varReference(name);
	return target === null ? name : target;
};

export const paintsAsColor = (value: string): boolean =>
	value !== '' && CSS.supports('color', value);
