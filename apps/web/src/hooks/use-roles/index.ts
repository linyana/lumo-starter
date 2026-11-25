import { rolesApi } from '@/api';
import { useEffect } from 'react';
import { useHttp } from '../use-http';

/** The roles this workspace can hand out: the system ones plus its own. */
export const useRoles = () => {
	const { data, initial, loading, fetchData } = useHttp({ endpoint: rolesApi.list });

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	return { roles: data ?? [], loading: loading || initial };
};
