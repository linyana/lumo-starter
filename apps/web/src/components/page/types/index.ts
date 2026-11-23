import type { ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';
import type { SlotClassNames } from '@/components/types';
import type { pageVariants } from '@/components/page/variant';

export type PageVariant = NonNullable<VariantProps<typeof pageVariants>['variant']>;

export type PageSlots = 'root' | 'header' | 'title' | 'description' | 'actions';

export type PageProps = {
	variant?: PageVariant;
	title?: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<PageSlots>;
};
