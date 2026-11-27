import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/components';
import { DesignShell } from '../shell';
import { TokenPanel } from './panel';

export const DesignTokensPage = () => {
	const [params] = useSearchParams();
	const [query, setQuery] = useState(params.get('token') ?? '');

	useEffect(() => {
		const requested = params.get('token');
		if (requested !== null) setQuery(requested);
	}, [params]);

	return (
		<DesignShell
			title="Tokens"
			description="Every token is read out of styles/index.css. Click a row to change it and see the page react."
			actions={
				<Input
					size="sm"
					className="w-52"
					placeholder="Filter tokens"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					clearable
				/>
			}
		>
			<TokenPanel query={query} />
		</DesignShell>
	);
};
