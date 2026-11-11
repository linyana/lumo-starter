/**
 * The strings a pro component hands to the parts it draws itself: one key per part it names, and no
 * key for a part it does not. Appearance is classes only — the theme's tokens are what an inline
 * style would otherwise have to repeat — so a slot is a string.
 *
 * `className` stays the shorthand for the root part; a slot written here wins over it.
 */
export type SlotClassNames<Slot extends string> = Partial<Record<Slot, string>>;
