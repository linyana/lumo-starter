import { createToastManager } from '@/components/ui/feedback/toast';

export const toastManager = createToastManager();

export const toastSuccess = (message: string): void => {
	toastManager.add({ title: message, type: 'success' });
};

export const toastError = (message: string): void => {
	toastManager.add({ title: message, type: 'error' });
};

export const toastWait = (message: string): string =>
	toastManager.add({ title: message, type: 'loading' });

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
