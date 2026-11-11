/**
 * Every call the client makes to the server, one folder per resource. Nothing above this layer names
 * a URL: a screen asks for `usersApi.create`, and the path, the verb and the `{ user }` envelope it
 * answers with stay in here.
 *
 * `lib/http` is the transport — the axios instance, the token, the single-flight refresh — and
 * exports `api`, the thin typed wrapper these modules are written with. The two are different jobs:
 * `api.post` sends a request, `usersApi.create` is the only place that knows where a user is posted.
 * The refresh call itself stays in `lib/http` because it must bypass the response interceptor.
 *
 * A resource module reaches for another one by its sibling path (`../roles`), never through this
 * barrel: a leaf importing the barrel that re-exports it would close a cycle. `lib/index.ts` says
 * the same about `@/lib`, for the same reason.
 *
 * The barrel is what a caller imports — the one line that decides which resource it wants is the
 * name it takes, and a named import still lets the bundler drop the resources it did not ask for.
 */
export * from './auth';
export * from './users';
