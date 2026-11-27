import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const uiDir = join(root, 'src/components/ui');
const stylesFile = join(root, 'src/styles/index.css');
const outFile = join(root, 'src/pages/design/generated/manifest.json');

type PropDoc = {
	name: string;
	type: string;
	optional: boolean;
	description?: string;
};

type ComponentDoc = {
	name: string;
	category: string;
	path: string;
	props: PropDoc[];
	tokens: string[];
	sharedTokens: string[];
};

const isDir = (path: string): boolean => statSync(path).isDirectory();

const filesUnder = (dir: string): string[] =>
	readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (isDir(path)) return filesUnder(path);
		return /\.(tsx?|css)$/.test(entry) ? [path] : [];
	});

const pascal = (kebab: string): string =>
	kebab
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

const componentDirs = readdirSync(uiDir)
	.filter((entry) => isDir(join(uiDir, entry)))
	.flatMap((category) =>
		readdirSync(join(uiDir, category))
			.filter((entry) => isDir(join(uiDir, category, entry)))
			.map((name) => ({ category, name, dir: join(uiDir, category, name) })),
	)
	.filter(({ dir }) => statSync(join(dir, 'index.tsx'), { throwIfNoEntry: false }) !== undefined);

const entries = componentDirs.map(({ category, name, dir }) => ({
	category,
	name,
	dir,
	file: join(dir, 'index.tsx'),
}));

const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config ?? {}, ts.sys, root);
const program = ts.createProgram({
	rootNames: entries.map((entry) => entry.file),
	options: { ...parsed.options, noEmit: true },
});
const checker = program.getTypeChecker();

const stylesText = readFileSync(stylesFile, 'utf8');

const utilities: { pattern: RegExp; token: string }[] = [];

const colorPrefixes =
	'bg|text|border|ring|fill|stroke|shadow|from|via|to|outline|decoration|caret|accent|divide'.split(
		'|',
	);

for (const [, suffix, token] of stylesText.matchAll(/--color-([\w-]+)\s*:\s*var\((--[\w-]+)\)/g)) {
	if (suffix === undefined || token === undefined) continue;
	for (const prefix of colorPrefixes) {
		utilities.push({ pattern: new RegExp(`\\b${prefix}-${suffix}\\b`), token });
	}
}

for (const direction of [
	'',
	'-t',
	'-b',
	'-s',
	'-e',
	'-l',
	'-r',
	'-tl',
	'-tr',
	'-bl',
	'-br',
	'-ss',
	'-se',
	'-es',
	'-ee',
]) {
	for (const size of ['', '-sm', '-md', '-lg', '-xl', '-2xl', '-3xl', '-4xl']) {
		utilities.push({
			pattern: new RegExp(`\\brounded${direction}${size}\\b`),
			token: '--radius',
		});
	}
}

for (const [, kind, suffix] of stylesText.matchAll(
	/--(shadow|duration|ease|animate)-([\w-]+)\s*:/g,
)) {
	if (kind === undefined || suffix === undefined) continue;
	utilities.push({ pattern: new RegExp(`\\b${kind}-${suffix}\\b`), token: `--${kind}-${suffix}` });
}

const tokensOf = (files: string[]): string[] => {
	const found = new Set<string>();

	for (const file of files) {
		const source = readFileSync(file, 'utf8');

		for (const [, token] of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
			if (token !== undefined) found.add(token);
		}

		for (const { pattern, token } of utilities) {
			if (pattern.test(source)) found.add(token);
		}
	}

	return [...found].sort((a, b) => a.localeCompare(b));
};

const propsOf = (entry: { dir: string }): PropDoc[] => {
	const candidates = readdirSync(entry.dir)
		.filter((name) => /\.tsx?$/.test(name))
		.sort((a, b) => Number(b === 'index.tsx') - Number(a === 'index.tsx') || a.localeCompare(b));

	for (const name of candidates) {
		const source = program.getSourceFile(join(entry.dir, name));
		if (source === undefined) continue;

		const moduleSymbol = checker.getSymbolAtLocation(source);
		if (moduleSymbol === undefined) continue;

		const exported = checker
			.getExportsOfModule(moduleSymbol)
			.find((symbol) => symbol.getName().endsWith('Props'));

		if (exported === undefined) continue;

		const type = checker.getDeclaredTypeOfSymbol(exported);
		const props: PropDoc[] = [];

		for (const property of checker.getPropertiesOfType(type)) {
			const declared = property.declarations ?? [];
			const own = declared.find((node) => {
				const file = node.getSourceFile().fileName;
				return relative(entry.dir, file) === '' || !relative(entry.dir, file).startsWith('..');
			});
			if (own === undefined) continue;
			if (property.getName().startsWith('__')) continue;

			const description = ts.displayPartsToString(property.getDocumentationComment(checker));
			const text = checker.typeToString(checker.getTypeOfSymbol(property));

			props.push({
				name: property.getName(),
				type: text.replace(/\s*\|\s*undefined$/, ''),
				optional: (property.flags & ts.SymbolFlags.Optional) !== 0,
				...(description === '' ? {} : { description }),
			});
		}

		return props.sort(
			(a, b) => Number(a.optional) - Number(b.optional) || a.name.localeCompare(b.name),
		);
	}

	return [];
};

const controlFile = join(root, 'src/lib/control/index.ts');
const controlTokens = tokensOf([controlFile]);

const manifest: { components: ComponentDoc[] } = {
	components: entries.map((entry) => {
		const files = filesUnder(entry.dir);
		const usesControl = files.some((file) =>
			readFileSync(file, 'utf8').includes("from '@/lib/control'"),
		);

		return {
			name: pascal(entry.name),
			category: entry.category,
			path: relative(join(root, 'src'), entry.dir).replaceAll('\\', '/'),
			props: propsOf(entry),
			tokens: tokensOf(files),
			sharedTokens: usesControl ? controlTokens : [],
		};
	}),
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(manifest, null, '\t')}\n`);

console.log(
	`${manifest.components.length} components, ${manifest.components.reduce((sum, item) => sum + item.props.length, 0)} props, ${manifest.components.reduce((sum, item) => sum + item.tokens.length, 0)} token references`,
);
