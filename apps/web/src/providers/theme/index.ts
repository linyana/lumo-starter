/**
 * The theme: the one piece of app state that lives outside us — on the document and in storage —
 * plus the control that flips it. See `context/` for the provider and `theme-toggle/` for the
 * button; both frames draw that button, so it is exported from here rather than from a layout.
 */
export { ThemeProvider, useTheme } from './context';
export { ThemeToggle } from './theme-toggle';
export type { Theme, ThemeContextValue, ThemeProviderProps } from './types';
