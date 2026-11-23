import { Field } from '@/components/ui/form/field';
import { Input } from '@/components/ui/form/input';
import type { ListFilter } from './types';

export const textFilter = ({
	name,
	active,
	clear,
	placeholder,
}: {
	name: string;
	active: boolean;
	clear: () => void;
	placeholder?: string;
}): ListFilter => ({
	field: (
		<Field name={name}>
			<Input placeholder={placeholder} />
		</Field>
	),
	active,
	clear,
});
