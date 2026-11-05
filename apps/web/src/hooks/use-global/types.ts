import type { z } from 'zod';
import type { globalSchema, themeSchema } from './schema';

/** One of the entries in `THEMES`, by construction. */
export type Theme = z.infer<typeof themeSchema>;

/** Everything the app remembers between visits. */
export type GlobalState = z.infer<typeof globalSchema>;

export type GlobalActions = {
	/**
	 * Merges a slice in. Both forms are zustand's own: the object, or `(state) => slice`, which reads
	 * the current value instead of one captured by an older render — a counter written as
	 * `count + 1` loses increments, `(state) => state.count + 1` cannot. The `replace` overload is
	 * deliberately absent: it would drop `actions` itself, which lives in the same object.
	 */
	set: (state: Partial<GlobalState> | ((state: GlobalState) => Partial<GlobalState>)) => void;
	/** Back to the initial values, with a slice on top for what the caller means to keep. */
	reset: (state?: Partial<GlobalState>) => void;
};

export type GlobalStore = GlobalState & { actions: GlobalActions };
