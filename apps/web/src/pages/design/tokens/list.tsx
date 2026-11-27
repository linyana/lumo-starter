import { TokenRow } from './token-row';

export const TokenList = ({ tokens }: { tokens: string[] }) => (
	<ul className="grid gap-x-6 sm:grid-cols-2">
		{tokens.map((name) => (
			<li key={name}>
				<TokenRow name={name} />
			</li>
		))}
	</ul>
);
