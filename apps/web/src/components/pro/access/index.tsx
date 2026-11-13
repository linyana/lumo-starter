import { createContext, useContext, type ReactNode } from 'react';
import { grantFor, type AccessGrant } from '@lumo/shared';

/**
 * The grant the things inside draw against: who is signed in, reduced to the permissions they hold.
 * It is read by the components that draw gated items — the columns of a table, the rows of a menu —
 * so the caller states an `access` block and never filters anything itself.
 *
 * It lives here, beside those components, because `providers/auth` already imports them (a guard
 * draws a `Button` and a `Spinner`); a table importing `providers/auth` back would be a cycle. This
 * module imports React and the shared package and nothing else, so both directions stay open.
 *
 * The app fills it once, from the session — `providers/auth/session` wraps its children. Anything
 * rendered without it — a story, a test, a page that needs no gating — gets an empty grant, so a
 * gated item is simply not drawn. The default is the honest one: this app has not said who you are.
 */
const AccessContext = createContext<AccessGrant>(grantFor());

type IPropsType = {
	grant: AccessGrant;
	children: ReactNode;
};

export const AccessProvider = ({ grant, children }: IPropsType) => (
	<AccessContext.Provider value={grant}>{children}</AccessContext.Provider>
);

/** The grant of the surrounding app, for the components that have to ask. */
export const useAccess = (): AccessGrant => useContext(AccessContext);
