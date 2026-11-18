import { createToastManager } from '@/components/feedback/toast';

/**
 * One manager for the whole app, so anything may queue a toast — a request failure included, which
 * happens outside React. `App` hands it to the `ToastProvider`; parts below read the same queue
 * through `useToast`.
 */
export const toastManager = createToastManager();

/** A write that landed, in the words the screen that asked for it chose. */
export const toastSuccess = (message: string): void => {
	toastManager.add({ title: message, type: 'success' });
};

/** The one failure notice the request layer raises: the API's own sentence. */
export const toastError = (message: string): void => {
	toastManager.add({ title: message, type: 'error' });
};

/**
 * A notice that opens as a wait and does not dismiss itself: what it became is decided by
 * `toastSettle`, which rewrites it in place. The id is that handle.
 */
export const toastWait = (message: string): string =>
	toastManager.add({ title: message, type: 'loading' });

/**
 * The wait `toastWait` opened, settled where it stands — the one place a write with nothing left on
 * screen can still say where it went. No message drops it instead, which is what an outcome the
 * screen says itself wants: the wait goes, nothing new opens.
 */
export const toastSettle = ({
	id,
	message,
	failed = false,
}: {
	id: string;
	message?: string;
	failed?: boolean;
}): void => {
	if (message === undefined) {
		toastManager.close(id);
		return;
	}

	toastManager.update(id, { title: message, type: failed ? 'error' : 'success' });
};
