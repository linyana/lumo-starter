import type {
	CreateUserInput,
	ListUsersQuery,
	Paginated,
	UpdateUserInput,
	User,
} from '@lumo/shared';
import { api } from '@/lib';

const list = (query: ListUsersQuery): Promise<Paginated<User>> =>
	api.get<Paginated<User>>({ url: '/users', params: { ...query } });

const create = (input: CreateUserInput): Promise<User> =>
	api.post<{ user: User }>({ url: '/users', body: input }).then((payload) => payload.user);

const update = ({ id, input }: { id: string; input: UpdateUserInput }): Promise<User> =>
	api.patch<{ user: User }>({ url: `/users/${id}`, body: input }).then((payload) => payload.user);

const remove = (id: string): Promise<void> => api.send({ method: 'delete', url: `/users/${id}` });

const removeMany = (ids: string[]): Promise<void> =>
	api.send({ method: 'post', url: '/users/batch-delete', body: { ids } });

export const usersApi = { list, create, update, remove, removeMany };
