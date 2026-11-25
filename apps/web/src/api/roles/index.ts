import type { CreateRoleInput, Role, UpdateRoleInput } from '@lumo/shared';
import { api } from '@/lib';

const list = (): Promise<Role[]> =>
	api.get<{ roles: Role[] }>({ url: '/roles' }).then((payload) => payload.roles);

const get = (id: string): Promise<Role> =>
	api.get<{ role: Role }>({ url: `/roles/${id}` }).then((payload) => payload.role);

const create = (input: CreateRoleInput): Promise<Role> =>
	api.post<{ role: Role }>({ url: '/roles', body: input }).then((payload) => payload.role);

const update = ({ id, input }: { id: string; input: UpdateRoleInput }): Promise<Role> =>
	api.patch<{ role: Role }>({ url: `/roles/${id}`, body: input }).then((payload) => payload.role);

const remove = (id: string): Promise<void> => api.send({ method: 'delete', url: `/roles/${id}` });

export const rolesApi = { list, get, create, update, remove };
