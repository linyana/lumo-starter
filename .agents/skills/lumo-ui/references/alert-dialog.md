# alert-dialog

> A modal that asks rather than offers: the page behind it is inert and a click outside will not dismiss it, so the only way out is one of the panel's own buttons. For the action that cannot be taken back.

## install

```bash
bunx shadcn@latest add @lumo/alert-dialog
```

- payload: `/r/alert-dialog.json`
- docs page: `/alert-dialog`
- comes with it: `@lumo/utils`, `@lumo/surface`
- npm packages: `@base-ui/react`
- lands in: `alert-dialog.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/alert-dialog.tsx

```tsx
import type { ComponentProps } from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils';
import { backdrop, description, modalViewport, panel, title } from '@/lib/surface';

export type BackdropProps = ComponentProps<typeof BaseAlertDialog.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseAlertDialog.Backdrop
			data-slot="alert-dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BaseAlertDialog.Close;

export type DescriptionProps = ComponentProps<typeof BaseAlertDialog.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseAlertDialog.Description
			data-slot="alert-dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseAlertDialog.Popup>;

/** The same panel a dialog is drawn in: the role underneath is the only difference. */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseAlertDialog.Popup
			data-slot="alert-dialog-popup"
			className={cn(panel, className)}
			{...props}
		/>
	);
}

export const Portal = BaseAlertDialog.Portal;

export const Root = BaseAlertDialog.Root;

export type TitleProps = ComponentProps<typeof BaseAlertDialog.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseAlertDialog.Title
			data-slot="alert-dialog-title"
			className={cn(title, className)}
			{...props}
		/>
	);
}

export const Trigger = BaseAlertDialog.Trigger;

export type ViewportProps = ComponentProps<typeof BaseAlertDialog.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseAlertDialog.Viewport
			data-slot="alert-dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const AlertDialog = {
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

### src/pages/AlertDialog/demos/basic.tsx

```tsx
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function Basic() {
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger render={<Button variant="destructive">delete workspace</Button>} />
			<AlertDialog.Portal>
				<AlertDialog.Backdrop />
				<AlertDialog.Viewport>
					<AlertDialog.Popup>
						<AlertDialog.Title>
							delete &ldquo;scheduled reports&rdquo;?
						</AlertDialog.Title>
						<AlertDialog.Description>
							two webhooks point at it and will stop firing. every report it has
							already sent stays where it was sent. this cannot be undone.
						</AlertDialog.Description>
						<div className="mt-6 flex justify-end gap-2">
							<AlertDialog.Close render={<Button variant="ghost">keep it</Button>} />
							<AlertDialog.Close
								render={<Button variant="destructive">delete</Button>}
							/>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Viewport>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
```

### src/pages/AlertDialog/demos/awaiting.tsx

```tsx
import { useState } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function Awaiting() {
	const [open, setOpen] = useState(false);
	const [revoking, setRevoking] = useState(false);

	async function revoke() {
		setRevoking(true);
		await new Promise((resolve) => setTimeout(resolve, 1200));
		setRevoking(false);
		setOpen(false);
	}

	return (
		<AlertDialog.Root open={open} onOpenChange={setOpen}>
			<AlertDialog.Trigger render={<Button variant="outline">revoke token</Button>} />
			<AlertDialog.Portal>
				<AlertDialog.Backdrop />
				<AlertDialog.Viewport>
					<AlertDialog.Popup>
						<AlertDialog.Title>revoke this token?</AlertDialog.Title>
						<AlertDialog.Description>
							three services sign with it and fail on their next request. the token
							cannot be restored, only replaced.
						</AlertDialog.Description>
						<div className="mt-6 flex justify-end gap-2">
							<AlertDialog.Close render={<Button variant="ghost">keep it</Button>} />
							{/* The confirm is not a Close: the panel stays until the request answers. */}
							<Button variant="destructive" loading={revoking} onClick={revoke}>
								revoke
							</Button>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Viewport>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
```
