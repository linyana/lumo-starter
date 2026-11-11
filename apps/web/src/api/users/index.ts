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

const remove = (id: string): Promise<void> => api.delete(`/users/${id}`);

/**
 * The resource as one client: `POST /users` and the rest of it, named by what the caller asks for
 * rather than by the function's own name — the folder says `users`, so `usersApi.create` says it
 * once where `createUser` said it twice.
 *
 * `Api` is in the name because a screen's `users` is the records themselves: the bare plural is the
 * data, the suffixed one is the wire.
 *
 * Each verb is declared on its own and only gathered here, so it is still a plain function when a
 * caller takes it off the object (`useHttp({ fn: usersApi.create })`) — nothing is bound to `this`.
 */
export const usersApi = { list, create, update, remove };
