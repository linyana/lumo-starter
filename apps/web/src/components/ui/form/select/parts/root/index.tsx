import { Select as BaseSelect } from '@base-ui/react/select';

export type SelectRootProps<
	SelectValue,
	Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<SelectValue, Multiple>;

export const SelectRoot = BaseSelect.Root;
