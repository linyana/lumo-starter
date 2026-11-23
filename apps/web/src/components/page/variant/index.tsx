import { tv } from 'tailwind-variants';
import { defaultVariant } from '@/components/page/variant/default';
import { settingsVariant } from '@/components/page/variant/settings';

export const pageVariants = tv({
	slots: {
		root: 'flex w-full flex-col gap-6',
		header: 'flex flex-wrap items-start gap-x-4 gap-y-2',
		heading: 'flex min-w-0 flex-col gap-1',
		title: 'truncate text-lg font-semibold',
		description: 'text-sm text-muted-foreground',
		actions: 'ms-auto flex shrink-0 items-center gap-2',
	},
	variants: {
		variant: {
			default: defaultVariant,
			settings: settingsVariant,
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});
