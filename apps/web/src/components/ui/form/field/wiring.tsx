import { createContext, useContext, type ReactNode } from 'react';

export type FieldWiring = Record<string, Record<string, unknown>>;

const NO_WIRING: FieldWiring = {};

const WiringContext = createContext<FieldWiring>(NO_WIRING);

export const FieldWiringProvider = ({
	wiring,
	children,
}: {
	wiring?: FieldWiring;
	children: ReactNode;
}) => <WiringContext.Provider value={wiring ?? NO_WIRING}>{children}</WiringContext.Provider>;

export const useFieldWiring = (name: string | undefined): Record<string, unknown> => {
	const wiring = useContext(WiringContext);
	return name === undefined ? NO_WIRING : (wiring[name] ?? NO_WIRING);
};

/**
 * A control written in the page keeps what it declares: own values replace the wired ones, and
 * own handlers run after them — replacing a handler instead of adding to it would drop the
 * behaviour the wiring exists for, silently. `onChange` is left out: the field composes that one,
 * because the value has to land in the form before either handler reads it.
 */
export const mergeWiring = ({
	wiring,
	own,
}: {
	wiring: Record<string, unknown>;
	own: Record<string, unknown>;
}): Record<string, unknown> => {
	const merged: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(wiring)) {
		if (key === 'onChange') continue;

		const override = own[key];
		if (override === undefined) {
			merged[key] = value;
			continue;
		}

		merged[key] =
			typeof value === 'function' && typeof override === 'function'
				? (...args: unknown[]) => {
						value(...args);
						override(...args);
					}
				: override;
	}

	return merged;
};
