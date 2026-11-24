import {
	userSettingContentDefaults,
	type UpdateUserSettingInput,
	type UserSetting,
	type UserSettingContent,
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
	content: UserSettingContent;
	saving: boolean;
	failed: (key: keyof UserSettingContent) => boolean;
	save: (input: UpdateUserSettingInput) => Promise<void>;
};

const SettingContext = createContext<SettingContextValue | null>(null);

const EMPTY: UserSetting = { type: 'user', content: userSettingContentDefaults, updatedAt: null };

export const SettingProvider = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();

	const [setting, setSetting] = useState<UserSetting>(EMPTY);
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState<keyof UserSettingContent | null>(null);

	const opener = useHttp({ endpoint: settingsApi.mine, toastError: false });
	const saver = useHttp({ endpoint: settingsApi.update, successMessage: 'Preference saved' });

	const { fetchData: open } = opener;
	const { fetchData: persist, loading: saving } = saver;

	useEffect(() => {
		if (status !== 'authenticated') {
			setSetting(EMPTY);
			setReady(false);
			return;
		}

		let live = true;

		// Rendering the app before the stored content arrives would mount every
		// list with the defaults, so the children wait for this one request.
		void open().then((result) => {
			if (!live) return;
			if (result?.ok === true) setSetting(result.data);
			setReady(true);
		});

		return () => {
			live = false;
		};
	}, [status, open]);

	const save = useCallback(
		async (input: UpdateUserSettingInput): Promise<void> => {
			const result = await persist(input);
			if (result === null) return;

			if (result.ok) {
				setSetting(result.data);
				// The red answers the value the server last refused, so only the save that replaces
				// that verdict may clear it.
				setFailed((current) =>
					current !== null && Object.hasOwn(input, current) ? null : current,
				);
				return;
			}

			setFailed((Object.keys(input) as (keyof UserSettingContent)[])[0] ?? null);
		},
		[persist],
	);

	const value = useMemo<SettingContextValue>(
		() => ({
			content: setting.content,
			saving,
			failed: (key) => failed === key,
			save,
		}),
		[setting.content, saving, failed, save],
	);

	if (status === 'authenticated' && !ready) return <FullPageLoader />;

	return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>;
};

export const useSetting = (): SettingContextValue => {
	const context = useContext(SettingContext);
	if (!context) throw new Error('useSetting must be used inside <SettingProvider>');
	return context;
};
