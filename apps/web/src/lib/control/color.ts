import type { Color, Emphasis } from './axes';

export const colorVars = {
	neutral:
		'[--intent:var(--foreground)] [--intent-solid:var(--secondary)] [--intent-on:var(--secondary-foreground)] [--intent-border:var(--border)]',
	primary:
		'[--intent:var(--primary)] [--intent-solid:var(--primary)] [--intent-on:var(--primary-foreground)] [--intent-border:var(--primary)]',
	success:
		'[--intent:var(--success)] [--intent-solid:var(--success)] [--intent-on:var(--success-foreground)] [--intent-border:var(--success)]',
	warning:
		'[--intent:var(--warning)] [--intent-solid:var(--warning)] [--intent-on:var(--warning-foreground)] [--intent-border:var(--warning)]',
	info: '[--intent:var(--info)] [--intent-solid:var(--info)] [--intent-on:var(--info-foreground)] [--intent-border:var(--info)]',
	destructive:
		'[--intent:var(--destructive)] [--intent-solid:var(--destructive)] [--intent-on:var(--destructive-foreground)] [--intent-border:var(--destructive)]',
} satisfies Record<Color, string>;

export const emphasis = {
	solid: 'border border-transparent bg-(--intent-solid) text-(--intent-on)',
	soft: 'border border-transparent bg-(--intent)/10 text-(--intent)',
	outline: 'border border-(--intent-border) text-(--intent)',
	ghost: 'text-(--intent)',
	link: 'text-(--intent) underline-offset-4 hover:underline',
} satisfies Record<Emphasis, string>;
