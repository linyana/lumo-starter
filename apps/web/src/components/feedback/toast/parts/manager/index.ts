import { Toast as BaseToast } from '@base-ui/react/toast';

/** The queue behind the provider, for the components that draw one toast. */
export const useToastManager = BaseToast.useToastManager;

/** A queue callers outside React can hold and hand to the provider. */
export const createToastManager = BaseToast.createToastManager;
