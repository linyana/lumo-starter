/** Every workspace href is `/:slug/<path>`; nothing outside this function builds one by hand. */
export const workspaceHref = ({ slug, path }: { slug: string; path?: string }): string =>
	path === undefined || path === '' ? `/${slug}` : `/${slug}/${path}`;
