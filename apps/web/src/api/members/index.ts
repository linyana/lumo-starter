import type {
	CreateMemberInput,
	ListMembersQuery,
	Member,
	Paginated,
	UpdateMemberInput,
} from '@lumo/shared';
import { api } from '@/lib';

const list = (query: ListMembersQuery): Promise<Paginated<Member>> =>
	api.get<Paginated<Member>>({ url: '/members', params: { ...query } });

const create = (input: CreateMemberInput): Promise<Member> =>
	api.post<{ member: Member }>({ url: '/members', body: input }).then((payload) => payload.member);

const update = ({ id, input }: { id: string; input: UpdateMemberInput }): Promise<Member> =>
	api
		.patch<{ member: Member }>({ url: `/members/${id}`, body: input })
		.then((payload) => payload.member);

const remove = (id: string): Promise<void> => api.send({ method: 'delete', url: `/members/${id}` });

const removeMany = (ids: string[]): Promise<void> =>
	api.send({ method: 'post', url: '/members/batch-delete', body: { ids } });

export const membersApi = { list, create, update, remove, removeMany };
