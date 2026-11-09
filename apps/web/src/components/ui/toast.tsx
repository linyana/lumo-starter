import { type ComponentProps, type ReactNode, createContext, useContext } from 'react';
import { Toast as BaseToast, type ToastRootToastObject } from '@base-ui/react/toast';
import { cn } from '@/lib/utils';
import { X, CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * A toast's action is a Button's small secondary shape, pulled up a pixel so it sits on the text's
 * line rather than the row's full height.
 */
const actionClasses = cn(
	buttonVariants({ variant: 'secondary', size: 'sm' }),
	'-my-1 h-7 px-2 text-xs',
);

export type ActionProps = Omit<ComponentProps<typeof BaseToast.Action>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * Takes its label from `actionProps` on the toast, so a caller that only queued one never has to
 * come back and render it. Renders nothing when the toast carries no action.
 */
export function Action({ className, ...props }: ActionProps) {
	return (
		<BaseToast.Action
			data-slot="toast-action"
			className={cn(actionClasses, className)}
			{...props}
		/>
	);
}

const closeClasses = cn(
	buttonVariants({ variant: 'ghost', size: 'icon' }),
	'-my-1 size-7 text-muted-foreground',
);

const closeGlyph = <X />;

export type CloseProps = Omit<ComponentProps<typeof BaseToast.Close>, 'className' | 'children'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Defaults to a cross. Give one to say "dismiss" in another glyph. */
	children?: ReactNode;
};

export function Close({ className, children = closeGlyph, ...props }: CloseProps) {
	return (
		<BaseToast.Close
			data-slot="toast-close"
			aria-label="Close"
			className={cn(closeClasses, className)}
			{...props}
		>
			{children}
		</BaseToast.Close>
	);
}

export type ContentProps = Omit<ComponentProps<typeof BaseToast.Content>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The one row a toast draws: a glyph, the text, then whatever acts. Behind the frontmost toast
 * it fades out, because the root above it is clipped and the text would otherwise show through.
 */
export function Content({ className, ...props }: ContentProps) {
	return (
		<BaseToast.Content
			data-slot="toast-content"
			className={cn(
				'flex items-start gap-3 p-3',
				'transition-opacity duration-(--duration-state)',
				'data-behind:opacity-0 data-expanded:opacity-100',
				className,
			)}
			{...props}
		/>
	);
}

export type DescriptionProps = Omit<ComponentProps<typeof BaseToast.Description>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** Defaults to the toast's own `description`, and renders nothing when there is none. */
export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseToast.Description
			data-slot="toast-description"
			className={cn('text-xs text-muted-foreground', className)}
			{...props}
		/>
	);
}

export const ToastItemContext = createContext<ToastRootToastObject | null>(null);

/**
 * The toast a part is drawn inside. Base UI hands the object to `Root` only and drops it down
 * to its own parts as `data-type`; a part of ours that needs the whole thing reads it here.
 */
export function useToastItem() {
	return useContext(ToastItemContext);
}

/** The glyph a type earns. `loading` is a state rather than an icon, so it gets the spinner. */
function glyphOf(type: string | undefined): ReactNode {
	switch (type) {
		case 'success':
			return <CircleCheck />;
		case 'error':
			return <CircleX />;
		case 'warning':
			return <TriangleAlert />;
		case 'info':
			return <Info />;
		case 'loading':
			return <Spinner className="size-4" label={null} />;
		default:
			return null;
	}
}

/** Every outcome takes its own ink; anything else falls back to the muted one. */
function toneOf(type: string | undefined) {
	if (type === 'success') return 'text-success';
	if (type === 'error') return 'text-destructive';
	if (type === 'warning') return 'text-warning';
	if (type === 'info') return 'text-info';
	return 'text-muted-foreground';
}

export type IconProps = {
	/** Overrides the type carried by the toast this sits in. */
	type?: string;
	/** A glyph of your own, which wins over the type. */
	icon?: ReactNode;
	className?: string;
};

/** Draws the toast's type, read off the root it sits in. Nothing to draw renders nothing. */
export function Icon({ type, icon, className }: IconProps) {
	const toast = useToastItem();
	const resolved = type ?? toast?.type;
	const glyph = icon ?? glyphOf(resolved);

	if (glyph === null) return null;

	return (
		<span
			data-slot="toast-icon"
			className={cn(
				'mt-0.5 flex size-4 shrink-0 items-center justify-center',
				'[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
				toneOf(resolved),
				className,
			)}
		>
			{glyph}
		</span>
	);
}

export const Portal = BaseToast.Portal;

export const Provider = BaseToast.Provider;

export type RootProps = Omit<ComponentProps<typeof BaseToast.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One toast in the stack. The toast object also becomes readable by our own parts. */
export function Root({ className, toast, ...props }: RootProps) {
	return (
		<ToastItemContext value={toast}>
			<BaseToast.Root
				data-slot="toast"
				toast={toast}
				className={cn(
					'absolute inset-x-0 top-0',
					// Newest first in the DOM, so the painting order has to be asked for explicitly.
					'[z-index:calc(100-var(--toast-index,0))]',
					'pointer-events-auto origin-top',
					'rounded-lg border bg-popover text-popover-foreground shadow-lifted',
					// The stack is entirely these variables: Base UI reports each toast's index, its
					// measured height and — expanded — the summed height above it, so the newest sits
					// against the top edge and the rest peek out below it, scaled back a little.
					'[--peek:0.75rem] [--gap:0.5rem]',
					'[--stack-y:calc(var(--toast-index,0)*var(--peek))]',
					'[--stack-scale:calc(1-var(--toast-index,0)*0.06)]',
					'[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--stack-y)_+_var(--toast-swipe-movement-y,0px)_+_var(--exit-y,0px)))_scale(var(--stack-scale))]',
					// Collapsed, every toast is clipped to the frontmost one's height; expanded, each
					// takes its own — which is also the unfurl that plays when the pointer arrives.
					'h-(--toast-frontmost-height)',
					// Height is the one layout property in the stack, and the only one that has to be:
					// it is what makes a folded card show exactly the frontmost one's worth of itself.
					// It gets the state token rather than the overlay one, so the page is laid out
					// again for a fraction of the time the composited properties are moving.
					'[transition:transform_var(--duration-overlay)_var(--ease-overlay),opacity_var(--duration-overlay)_var(--ease-overlay),height_var(--duration-state)_var(--ease-overlay)]',
					'data-expanded:[--stack-y:calc(var(--toast-offset-y,0px)_+_var(--toast-index,0)*var(--gap))]',
					'data-expanded:[--stack-scale:1]',
					'data-expanded:h-(--toast-height)',
					// It arrives from above its slot and, dismissed without a swipe, drifts back up as it
					// goes. A swiped toast is already where the finger left it, so `--exit-y` stays out of
					// the way — the swipe offset in the transform above is what carries it off.
					'data-starting-style:[--stack-y:-1rem] data-starting-style:opacity-0',
					'data-ending-style:not-data-[swipe-direction]:[--exit-y:-0.5rem]',
					'data-ending-style:opacity-0',
					// Past the provider's limit a toast stays mounted but inert, so it is drawn nowhere.
					'data-limited:hidden',
					'data-instant:transition-none',
					className,
				)}
				{...props}
			/>
		</ToastItemContext>
	);
}

export type TitleProps = Omit<ComponentProps<typeof BaseToast.Title>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** Defaults to the toast's own `title`, and renders nothing when there is none. */
export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseToast.Title
			data-slot="toast-title"
			className={cn('text-sm font-medium', className)}
			{...props}
		/>
	);
}

export type ViewportProps = Omit<ComponentProps<typeof BaseToast.Viewport>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The fixed strip the stack hangs from: a centred line under the top edge. Every toast inside is
 * positioned against it, so the box itself stays empty and only the toasts take pointer events —
 * a page never loses that strip to it.
 */
export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseToast.Viewport
			data-slot="toast-viewport"
			className={cn(
				// Over-constrained left/right with auto margins is what centres it at every width.
				'pointer-events-none fixed inset-x-4 top-4 mx-auto max-w-96',
				// Above everything: a toast is true whatever else is open.
				'z-70',
				className,
			)}
			{...props}
		/>
	);
}

/** A toast unless you say otherwise: its type, its words, then whatever acts on it. */
function Interior({ toast }: { toast: ToastRootToastObject }) {
	return (
		<>
			<Icon />
			<div className="flex min-w-0 flex-1 items-start gap-2">
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<Title />
					{/* With no title the description is the whole message, so it takes the body size. */}
					<Description className={toast.title === undefined ? 'text-sm' : undefined} />
				</div>
				<Action />
				<Close />
			</div>
		</>
	);
}

export type ToasterProps = Omit<ViewportProps, 'children'> & {
	/** Draws each toast yourself, given the toast being drawn. */
	children?: (toast: ToastRootToastObject) => ReactNode;
};

/**
 * The stack, mounted once inside a `Provider`. It maps the queue to parts — the one piece of a
 * toast nobody should have to write twice — and leaves everything else to them.
 */
export function Toaster({ className, children, ...props }: ToasterProps) {
	const { toasts } = BaseToast.useToastManager();

	return (
		<Portal>
			<Viewport className={className} {...props}>
				{toasts.map((toast) => (
					<Root key={toast.id} toast={toast}>
						<Content>
							{children === undefined ? <Interior toast={toast} /> : children(toast)}
						</Content>
					</Root>
				))}
			</Viewport>
		</Portal>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Toast = {
	Provider,
	Portal,
	Viewport,
	Root,
	Content,
	Icon,
	Title,
	Description,
	Action,
	Close,
	/** Provider, portal and viewport assembled, with the queue already mapped to parts. */
	Toaster,
	useToastManager: BaseToast.useToastManager,
	/** Queues a toast from outside React — pass it to `Provider` and use it anywhere. */
	createToastManager: BaseToast.createToastManager,
};
