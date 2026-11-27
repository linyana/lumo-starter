import manifest from '../generated/manifest.json';

export type PropDoc = {
	name: string;
	type: string;
	optional: boolean;
	description?: string;
};

export type ComponentDoc = {
	name: string;
	category: string;
	path: string;
	props: PropDoc[];
	tokens: string[];
	sharedTokens: string[];
};

export const components: ComponentDoc[] = manifest.components;

export const docOf = (name: string): ComponentDoc | undefined =>
	components.find((item) => item.name.toLowerCase() === name.toLowerCase());
