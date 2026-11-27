import type { Color, Emphasis } from './axes';

export const colorVars = {
	neutral:
		'[--tone:var(--foreground)] [--tone-solid:var(--secondary)] [--tone-on:var(--secondary-foreground)] [--tone-border:var(--border)]',
	primary:
		'[--tone:var(--primary)] [--tone-solid:var(--primary)] [--tone-on:var(--primary-foreground)] [--tone-border:var(--primary)]',
	success:
		'[--tone:var(--success)] [--tone-solid:var(--success)] [--tone-on:var(--success-foreground)] [--tone-border:var(--success)]',
	warning:
		'[--tone:var(--warning)] [--tone-solid:var(--warning)] [--tone-on:var(--warning-foreground)] [--tone-border:var(--warning)]',
	info: '[--tone:var(--info)] [--tone-solid:var(--info)] [--tone-on:var(--info-foreground)] [--tone-border:var(--info)]',
	destructive:
		'[--tone:var(--destructive)] [--tone-solid:var(--destructive)] [--tone-on:var(--destructive-foreground)] [--tone-border:var(--destructive)]',
} satisfies Record<Color, string>;

export const emphasis = {
	solid: 'border border-transparent bg-(--tone-solid) text-(--tone-on)',
	soft: 'border border-transparent bg-(--tone)/10 text-(--tone)',
	outline: 'border border-(--tone-border) text-(--tone)',
	ghost: 'text-(--tone)',
	link: 'text-(--tone) underline-offset-4 hover:underline',
} satisfies Record<Emphasis, string>;
