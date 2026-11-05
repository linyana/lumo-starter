# form

> The fields as one submission: it collects their values, checks them on submit, moves focus to the first one that failed, and files every verdict — a browser's, a validator's or a server's — back in the field it belongs to. Nothing is wired between the two by hand.

## install

```bash
bunx shadcn@latest add @lumo/form
```

- payload: `/r/form.json`
- docs page: `/form`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `form.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/form.tsx

```tsx
import { Form as BaseForm, type FormProps as BaseFormProps } from '@base-ui/react/form';
import { cn } from '@/lib/utils';

/**
 * The verdicts a form holds for its fields, keyed by the `name` on their `Field.Root` — the same
 * shape a server action returns, so what a server answers goes in unchanged.
 */
export type FormErrors = Record<string, string | string[]>;

export type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
	BaseFormProps<Values>,
	'className' | 'errors'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Keyed by each `Field.Root`'s `name`; handed to Base UI as it stands. */
	errors?: FormErrors;
};

/**
 * A native `<form>` that knows about the fields inside it: it collects their values, validates them
 * on submit, moves focus to the first one that failed, and hands each error back to its own field —
 * so nothing is wired between the two by hand.
 *
 * The stack is the only appearance it adds. Every judgement about *when* a verdict is delivered
 * belongs to `validationMode`, here for the whole form and on a single `Field.Root` for one field.
 */
export function Form<Values extends Record<string, unknown> = Record<string, unknown>>({
	className,
	...props
}: FormProps<Values>) {
	return (
		<BaseForm data-slot="form" className={cn('flex flex-col gap-4', className)} {...props} />
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Form/demos/basic.tsx

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * `required` and `type="email"` are the validation — the form reads them off the controls and reports
 * each in its own field, and `onFormSubmit` is only reached once they all pass.
 */
export default function Basic() {
	const [sent, setSent] = useState<Record<string, unknown> | null>(null);

	return (
		<Form className="w-full max-w-sm" onFormSubmit={(values) => setSent(values)}>
			<Field.Root name="email">
				<Field.Label>email</Field.Label>
				<Input type="email" required placeholder="you@example.com" />
				<Field.Error match="valueMissing">an address is required.</Field.Error>
				<Field.Error match="typeMismatch">that is missing an @.</Field.Error>
			</Field.Root>

			<Field.Root name="name">
				<Field.Label>name</Field.Label>
				<Input required placeholder="Ada Lovelace" />
				<Field.Error match="valueMissing">a name is required.</Field.Error>
			</Field.Root>

			<Button type="submit" className="self-start">
				subscribe
			</Button>

			{sent !== null && (
				<p className="text-sm text-muted-foreground">{JSON.stringify(sent)}</p>
			)}
		</Form>
	);
}
```

### src/pages/Form/demos/errors.tsx

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/** A name a server would answer for — and the only thing a browser cannot know. */
const taken = ['admin', 'root', 'lumo'];

/** The wait a server would take. */
const answer = () => new Promise((resolve) => setTimeout(resolve, 600));

/**
 * What only the server can decide arrives as `errors`, keyed by the field's `name`, and lands in that
 * field's own `Error` — no message is repeated at the top of the form. Editing the field clears it.
 *
 * The username is `required` and its `Error` is matched, so the field has a written sentence of its
 * own; the server's still wins the line while the form holds it, because that one is about the value
 * that was actually sent. Empty it and submit to see the constraint answer instead.
 */
export default function ServerErrors() {
	const [errors, setErrors] = useState<FormErrors>({});
	const [saving, setSaving] = useState(false);

	return (
		<Form
			className="w-full max-w-sm"
			errors={errors}
			onFormSubmit={async (values) => {
				setSaving(true);
				await answer();
				const username = String(values.username ?? '');
				setErrors(taken.includes(username) ? { username: `“${username}” is taken` } : {});
				setSaving(false);
			}}
		>
			<Field.Root name="username">
				<Field.Label>username</Field.Label>
				<Input required defaultValue="admin" autoComplete="username" placeholder="ada" />
				<Field.Description>letters, digits and dashes.</Field.Description>
				<Field.Error match="valueMissing">a username is required.</Field.Error>
			</Field.Root>

			<Button type="submit" loading={saving} className="self-start">
				claim it
			</Button>
		</Form>
	);
}
```
