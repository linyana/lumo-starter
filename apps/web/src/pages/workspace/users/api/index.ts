import type { ListUsersQuery, Paginated, UpdateUserInput, User } from '@lumo/shared';
import { api } from '@/lib';

export const listUsers = (query: ListUsersQuery): Promise<Paginated<User>> =>
	api.get<Paginated<User>>('/users', { ...query });

export const updateUser = (id: string, input: UpdateUserInput): Promise<User> =>
	api.patch<{ user: User }>(`/users/${id}`, input).then((payload) => payload.user);

export const deleteUser = (id: string): Promise<void> => api.delete(`/users/${id}`);
