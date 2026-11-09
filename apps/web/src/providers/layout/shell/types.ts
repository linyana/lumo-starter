import type { LayoutNavEntry } from '@/components/blocks/layout';

export type AppShellProps = {
	/**
	 * The rows the rail draws, handed over by `providers/routes` — derived there from the route
	 * table, so the shell never reads `src/routes.tsx` and a screen can import this module without
	 * closing a cycle through `@/pages`.
	 */
	nav: LayoutNavEntry[];
};
