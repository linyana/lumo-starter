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
