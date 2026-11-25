import { rolesApi } from '@/api';
import { useEffect } from 'react';
import { useHttp } from '../use-http';

export const useRoles = () => {
	const { data, initial, loading, fetchData } = useHttp({ endpoint: rolesApi.list });

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	return { roles: data ?? [], loading: loading || initial };
};
