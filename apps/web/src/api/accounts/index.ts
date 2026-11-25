import type {
	CreateAccountInput,
	ListAccountsQuery,
	Paginated,
	UpdateAccountInput,
	Account,
} from '@lumo/shared';
import { api } from '@/lib';

const list = (query: ListAccountsQuery): Promise<Paginated<Account>> =>
	api.get<Paginated<Account>>({ url: '/accounts', params: { ...query } });

const create = (input: CreateAccountInput): Promise<Account> =>
	api
		.post<{ account: Account }>({ url: '/accounts', body: input })
		.then((payload) => payload.account);

const update = ({ id, input }: { id: string; input: UpdateAccountInput }): Promise<Account> =>
	api
		.patch<{ account: Account }>({ url: `/accounts/${id}`, body: input })
		.then((payload) => payload.account);

const remove = (id: string): Promise<void> =>
	api.send({ method: 'delete', url: `/accounts/${id}` });

const removeMany = (ids: string[]): Promise<void> =>
	api.send({ method: 'post', url: '/accounts/batch-delete', body: { ids } });

export const accountsApi = { list, create, update, remove, removeMany };
