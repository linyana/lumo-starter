/**
 * The session: who is signed in, how the app trades its refresh cookie for a pair of tokens, and the
 * guards a route asks for. The frame the anonymous screens sit in is a layout, not a session
 * concern — `providers/layout/auth`.
 */
export * from './guards';
export * from './session';
