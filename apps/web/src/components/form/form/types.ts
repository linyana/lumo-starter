import type { ReactNode } from 'react';
import type { ZodError, ZodType } from 'zod';
import type { FormRootProps } from './parts';

/**
 * The verdicts a form holds for its fields, keyed by the `name` on their `FieldRoot` — the same
 * shape a server action returns, so what a server answers goes in unchanged.
 */
export type FormErrors = Record<string, FormError>;

/** One verdict: a sentence, or the several a field can fail with at once. */
export type FormError = string | string[];

/** What the fields of one form hold, by name. The controls' own values, before any rule reads them. */
export type FormValues = Record<string, unknown>;

/** What `<Form>` tells the instance it is: read by `submit`, never by a screen. */
export type FormConfig = {
	schema?: ZodType;
	onSubmit?: (values: never) => void | Promise<unknown>;
	/** Called with every value after `settle` — what makes a form a live query instead of one submit. */
	onChange?: (values: FormValues) => void;
	settle?: number;
	/** The element the fields are drawn in, so a failed submit can put the cursor on the first one. */
	element?: { current: HTMLFormElement | null };
};

/**
 * One form's values, and the one way through them. Every control under the form reports into it and
 * reads out of it, so the values live in one place — which is what makes a body, a reset and a
 * filter possible without each screen keeping its own copy of the same state.
 *
 * The controls keep their own DOM value; this is the copy the wire reads, written by their
 * `onChange`. `reset` is the one write that goes the other way, and it does it by remounting the
 * fields — the one that was reset, or all of them — so nothing stale survives on the other side of
 * the two.
 *
 * `submit` is the only validation path: it reads the values, holds them to the schema, puts every
 * verdict under the field it is about, and hands the parsed values to `onSubmit` only once nothing
 * failed. The request is not its business — `onSubmit` is the caller's, body and all.
 */
export type FormInstance = {
	/** The last verdict, by field name. */
	readonly errors: FormErrors;
	/**
	 * Bumped by the whole-form `reset`; the form is drawn under it, so every field is mounted again.
	 * One field starting over moves its `revision` instead, and the rest keep what they hold.
	 */
	readonly epoch: number;
	/**
	 * Every value now, blanks left out — what a schema, a query or a body reads. The same object until
	 * the next write, so a caller may compare two reads by identity.
	 */
	values: () => FormValues;
	/**
	 * Whether anything differs from what the form opened with — blank on both sides is no difference.
	 * The baseline is the `initial` values the instance already keeps, so a screen never restates them.
	 */
	changed: () => boolean;
	/**
	 * How many times this field has been told to start over — the key its control is drawn under. A
	 * write does not move it, so a field keeps its DOM value and its caret while it is typed into.
	 */
	revision: (name: string) => number;
	/**
	 * How many times this field has been told the same thing again — a submit that finds the sentence it
	 * already put on screen, rather than a new one. One submit reminds once, at the first field that
	 * repeated; what to do about being repeated is the line's own business, this only counts it.
	 */
	nudge: (name: string) => number;
	get: (name: string) => unknown;
	set: (update: { name: string; value: unknown }) => void;
	/**
	 * Announce that the values moved without writing one. `<Form>` says it once the values it opens
	 * with are in, because that lands during a render no watcher is listening to yet.
	 */
	notify: () => void;
	/** Hear every write. `useWatch` is the only caller. */
	subscribe: (watcher: () => void) => () => void;
	/**
	 * Back to what the form opened with: naming one field restores that one, and naming nothing restores
	 * the whole form. Its verdict goes with it, because it was about a value that is no longer there.
	 */
	reset: (name?: string) => void;
	/**
	 * The same start over as `reset(name)`, for a field with nothing to go back to: the name leaves the
	 * values the form opened with as well, so a filter a reader lifts is lifted rather than restored.
	 */
	clear: (name: string) => void;
	/** Draw the fields from these values, now. What `<Form initial>` does on the render it mounts. */
	seed: (values?: FormValues) => void;
	/** Validate, then hand the parsed values to `onSubmit`. What every submit button calls. */
	submit: () => void;
	/** Verdicts from anywhere: a zod error is mapped onto the names it names. */
	setErrors: (input: FormErrors | ZodError) => void;
	/**
	 * The API's own verdicts: a failure that names fields lands under them, and this answers whether
	 * any did — `false` is the caller's cue to let `useHttp` show its toast. Nothing is toasted here.
	 */
	setApiError: (error: unknown) => boolean;
	/** Called by `<Form>` while it renders, so the latest props are the ones `submit` reads. */
	config: (next: FormConfig) => void;
};

/** The form a reader follows, with nothing named. */
export type FormArgs = {
	form: FormInstance;
};

/** The form a watcher follows, and the one field it names. */
export type WatchArgs = FormArgs & {
	/** The `name` on the `FieldRoot`, the same key `errors` is held under. */
	name: string;
};

/** What the fields of a form read: the instance, and the rules each of them is held to. */
export type FormContextValue = {
	form: FormInstance;
	/** The object schema every field cuts its own rule out of. Absent on an unruled form. */
	schema?: ZodType;
};

/** What a form is submitted with, apart from the element it is drawn in. */
export type FormSubmissionProps<Input> = {
	/** The instance, when the screen needs to prefill, reset, or submit from somewhere else. */
	form?: FormInstance;
	/** The rules the values are read by — the same object the API parses the body with. */
	schema?: ZodType<Input>;
	/** What the form opens with. Read once, and again by `reset`. */
	initial?: FormValues;
	/**
	 * Called once every field has passed, with the parsed values — trimmed, lowercased, typed. A body
	 * that is not these values is assembled here, because that mapping is the screen's business.
	 */
	onSubmit?: (values: Input) => void | Promise<unknown>;
	/**
	 * Called with the values after every write, `settle` milliseconds after the last one. A form with
	 * this is not submitted at all: it reports, and the caller decides what a change means — which is
	 * how a filter panel speaks to the query behind the table.
	 */
	onChange?: (values: FormValues) => void;
	/** How long a write waits before `onChange` hears it. Typing is a burst; picking is one answer. */
	settle?: number;
	children: ReactNode;
};

/**
 * The submission the form is, and the appearance of the element it is drawn in. What is left out is
 * precisely what the instance supplies: the verdicts and the moment of reading them.
 */
export type FormProps<
	Input,
	Values extends Record<string, unknown> = Record<string, unknown>,
> = FormSubmissionProps<Input> &
	Omit<FormRootProps<Values>, 'errors' | 'children' | 'onSubmit' | 'onFormSubmit' | 'onChange'>;
