import type { UpdateAccountSettingInput, AccountSetting } from '@lumo/shared';
import { api } from '@/lib';

const mine = (): Promise<AccountSetting> =>
	api.get<{ setting: AccountSetting }>({ url: '/settings/me' }).then((payload) => payload.setting);

const update = (input: UpdateAccountSettingInput): Promise<AccountSetting> =>
	api
		.patch<{ setting: AccountSetting }>({ url: '/settings/me', body: input })
		.then((payload) => payload.setting);

export const settingsApi = { mine, update };
