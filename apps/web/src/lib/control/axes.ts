export const SIZE = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof SIZE)[number];

export const EMPHASIS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const;
export type Emphasis = (typeof EMPHASIS)[number];

export const COLOR = ['neutral', 'primary', 'success', 'warning', 'info', 'destructive'] as const;
export type Color = (typeof COLOR)[number];

export const STRENGTH = ['soft', 'base', 'strong'] as const;
export type Strength = (typeof STRENGTH)[number];

export const STATE = [
	'hover',
	'focus',
	'pressed',
	'selected',
	'open',
	'disabled',
	'loading',
	'invalid',
] as const;
export type UiState = (typeof STATE)[number];

export const STANDARD = {
	size: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
	variant: ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
} as const;

export const COLOR_ALIAS = {
	error: 'destructive',
	danger: 'destructive',
	ok: 'success',
	brand: 'primary',
} as const satisfies Record<string, Color>;

export const COLOR_TOKENS = {
	neutral: {
		color: '--foreground',
		solid: '--secondary',
		on: '--secondary-foreground',
		border: '--border',
	},
	primary: {
		color: '--primary',
		solid: '--primary',
		on: '--primary-foreground',
		border: '--primary',
	},
	success: {
		color: '--success',
		solid: '--success',
		on: '--success-foreground',
		border: '--success',
	},
	warning: {
		color: '--warning',
		solid: '--warning',
		on: '--warning-foreground',
		border: '--warning',
	},
	info: { color: '--info', solid: '--info', on: '--info-foreground', border: '--info' },
	destructive: {
		color: '--destructive',
		solid: '--destructive',
		on: '--destructive-foreground',
		border: '--destructive',
	},
} as const satisfies Record<Color, Record<'color' | 'solid' | 'on' | 'border', string>>;

export const STATE_ATTR = {
	pressed: 'data-pressed',
	selected: 'data-selected',
	open: 'data-popup-open',
	disabled: 'data-disabled',
	loading: 'data-loading',
	invalid: 'data-invalid',
} as const satisfies Partial<Record<UiState, string>>;

export const LIVE_STATE = ['hover', 'focus'] as const satisfies readonly UiState[];
