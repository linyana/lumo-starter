import { Toast } from '@/components/ui/toast';

/**
 * One manager for the whole app, so anything may queue a toast — a request
 * failure included, which happens outside React. `App` hands it to the
 * `Toast.Provider`; parts below read the same queue through `useToastManager`.
 */
export const toastManager = Toast.createToastManager();

/** The one failure notice the request layer raises: the API's own sentence. */
export const toastError = (message: string): void => {
	toastManager.add({ title: message, type: 'error' });
};
