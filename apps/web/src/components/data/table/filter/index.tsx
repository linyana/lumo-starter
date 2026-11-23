import type { TableFilterProps } from '@/components/data/table/types';
import { Field } from '@/components/form/field';
import { Input } from '@/components/form/input';

type IPropsType = {
	name: string;
	active: boolean;
	clear: () => void;
	placeholder?: string;
};

export const textFilter = ({ name, active, clear, placeholder }: IPropsType): TableFilterProps => ({
	field: (
		<Field name={name}>
			<Input placeholder={placeholder} />
		</Field>
	),
	active,
	clear,
});
