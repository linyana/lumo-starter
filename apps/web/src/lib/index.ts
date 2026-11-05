/**
 * Everything the app shares outside React. Each module is a folder with its own `index.ts`, so a
 * new module is one line here and nothing else.
 *
 * Import from this barrel only where the whole of it is fair game. The copied `components/ui`
 * primitives keep importing the one module they need — e.g. `@/lib/utils` — because a leaf that
 * only wants `cn` should not pull the http client in with it, and `lib/toast` importing
 * `components/ui/toast` would make this barrel circular.
 */
export * from './control';
export * from './form';
export * from './http';
export * from './measure';
export * from './motion';
export * from './surface';
export * from './toast';
export * from './utils';
