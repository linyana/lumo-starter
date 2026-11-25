export const workspaceHref = ({ slug, path }: { slug: string; path?: string }): string =>
	path === undefined || path === '' ? `/${slug}` : `/${slug}/${path}`;
