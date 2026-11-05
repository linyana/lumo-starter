import type { ReactNode } from 'react';

export type AuthLayoutProps = {
	title: string;
	description?: string;
	children: ReactNode;
	footer: ReactNode;
};
