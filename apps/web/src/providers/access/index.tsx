import { grantFor, type AccessGrant } from '@lumo/shared';
import { createContext, useContext, type ReactNode } from 'react';

const AccessContext = createContext<AccessGrant>(grantFor());

type IPropsType = {
	grant: AccessGrant;
	children: ReactNode;
};

export const AccessProvider = ({ grant, children }: IPropsType) => (
	<AccessContext.Provider value={grant}>{children}</AccessContext.Provider>
);

export const useAccess = (): AccessGrant => useContext(AccessContext);
