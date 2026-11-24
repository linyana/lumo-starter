import type { UpdateUserSettingInput, UserSetting } from '@lumo/shared';
import { api } from '@/lib';

const mine = (): Promise<UserSetting> =>
	api.get<{ setting: UserSetting }>({ url: '/settings/me' }).then((payload) => payload.setting);

const update = (input: UpdateUserSettingInput): Promise<UserSetting> =>
	api
		.patch<{ setting: UserSetting }>({ url: '/settings/me', body: input })
		.then((payload) => payload.setting);

export const settingsApi = { mine, update };
