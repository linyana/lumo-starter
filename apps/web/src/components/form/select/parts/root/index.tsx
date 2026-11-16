import { Select as BaseSelect } from '@base-ui/react/select';

export type SelectRootProps<
	SelectValue,
	Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<SelectValue, Multiple>;

/** The state: the value, the open flag, and whether one option or many can be held. */
export const SelectRoot = BaseSelect.Root;
