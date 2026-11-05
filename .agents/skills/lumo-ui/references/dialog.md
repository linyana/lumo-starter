# dialog

> Modal dialog. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/dialog
```

- payload: `/r/dialog.json`
- docs page: `/dialog`
- comes with it: `@lumo/utils`, `@lumo/surface`
- npm packages: `@base-ui/react`
- lands in: `dialog.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/dialog.tsx

```tsx
import type { ComponentProps } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';
import { backdrop, description, modalViewport, panel, title } from '@/lib/surface';

export type BackdropProps = ComponentProps<typeof BaseDialog.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BaseDialog.Close;

export type DescriptionProps = ComponentProps<typeof BaseDialog.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseDialog.Popup>;

export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseDialog.Popup data-slot="dialog-popup" className={cn(panel, className)} {...props} />
	);
}

export const Portal = BaseDialog.Portal;

export const Root = BaseDialog.Root;

export type TitleProps = ComponentProps<typeof BaseDialog.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseDialog.Title data-slot="dialog-title" className={cn(title, className)} {...props} />
	);
}

export const Trigger = BaseDialog.Trigger;

export type ViewportProps = ComponentProps<typeof BaseDialog.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseDialog.Viewport
			data-slot="dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Dialog = {
	Root,
	Trigger,
	Portal,
	Close,
	Backdrop,
	Viewport,
	Popup,
	Title,
	Description,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Dialog/demos/basic.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export default function Basic() {
	return (
		<Dialog.Root>
			<Dialog.Trigger render={<Button variant="outline">open dialog</Button>} />
			<Dialog.Portal>
				<Dialog.Backdrop />
				<Dialog.Viewport>
					<Dialog.Popup>
						<Dialog.Title>deploy to production?</Dialog.Title>
						<Dialog.Description>
							the site rebuilds in about a minute. the previous build stays live until
							the new one answers.
						</Dialog.Description>
						<div className="mt-6 flex justify-end gap-2">
							<Dialog.Close render={<Button variant="ghost">cancel</Button>} />
							<Dialog.Close render={<Button>deploy</Button>} />
						</div>
					</Dialog.Popup>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
```

### src/pages/Dialog/demos/confirm.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export default function Confirm() {
	return (
		<Dialog.Root>
			<Dialog.Trigger render={<Button variant="destructive">delete workspace</Button>} />
			<Dialog.Portal>
				<Dialog.Backdrop />
				<Dialog.Viewport>
					<Dialog.Popup>
						<Dialog.Title>delete &ldquo;scheduled reports&rdquo;?</Dialog.Title>
						<Dialog.Description>
							two webhooks point at it and will stop firing. this cannot be undone.
						</Dialog.Description>
						<div className="mt-6 flex justify-end gap-2">
							<Dialog.Close render={<Button variant="ghost">keep it</Button>} />
							<Dialog.Close render={<Button variant="destructive">delete</Button>} />
						</div>
					</Dialog.Popup>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
```
