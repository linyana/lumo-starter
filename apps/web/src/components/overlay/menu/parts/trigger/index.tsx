import { Menu as BaseMenu } from '@base-ui/react/menu';

export type MenuTriggerProps<Payload = unknown> = BaseMenu.Trigger.Props<Payload>;

/** The button that opens it, appearance-free: compose a `Button` through `render`. */
export const MenuTrigger = BaseMenu.Trigger;
