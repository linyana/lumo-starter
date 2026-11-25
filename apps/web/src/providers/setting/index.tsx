import {
	accountSettingContentDefaults,
	type UpdateAccountSettingInput,
	type AccountSetting,
	type AccountSettingContent,
} from '@lumo/shared';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { settingsApi } from '@/api';
import { useHttp } from '@/hooks';
import { FullPageLoader, useAuth } from '@/providers/auth';

type SettingContextValue = {
	settings: AccountSettingContent;
	update: (input: UpdateAccountSettingInput) => Promise<AccountSettingContent>;
};

const SettingContext = createContext<SettingContextValue | null>(null);

const EMPTY: AccountSetting = {
	type: 'account',
	content: accountSettingContentDefaults,
	updatedAt: null,
};

export const SettingProvider = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();

	const [setting, setSetting] = useState<AccountSetting>(EMPTY);
	const [ready, setReady] = useState(false);

	const { fetchData: load } = useHttp({ endpoint: settingsApi.mine, toastError: false });

	useEffect(() => {
		if (status !== 'authenticated') {
			setSetting(EMPTY);
			setReady(false);
			return;
		}

		let live = true;

		void load().then((result) => {
			if (!live) return;
			if (result?.ok === true) setSetting(result.data);
			setReady(true);
		});

		return () => {
			live = false;
		};
	}, [status, load]);

	const update = useCallback(
		async (input: UpdateAccountSettingInput): Promise<AccountSettingContent> => {
			const next = await settingsApi.update(input);
			setSetting(next);
			return next.content;
		},
		[],
	);

	const value = useMemo<SettingContextValue>(
		() => ({ settings: setting.content, update }),
		[setting.content, update],
	);

	if (status === 'authenticated' && !ready) return <FullPageLoader />;

	return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>;
};

export const useSetting = (): SettingContextValue => {
	const context = useContext(SettingContext);
	if (!context) throw new Error('useSetting must be used inside <SettingProvider>');
	return context;
};
