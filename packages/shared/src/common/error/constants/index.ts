/**
 * The only failures the API can name. A client switches on these; the API owns
 * what each one means on the wire (`status` and a default sentence, see
 * `apps/api/src/common/errors/table/index.ts`). Adding a business rule does not
 * add a code — it sends one of these with its own message.
 */
export const ERROR_CODES = [
	'BAD_REQUEST',
	'VALIDATION_FAILED',
	'UNAUTHORIZED',
	'FORBIDDEN',
	'NOT_FOUND',
	'CONFLICT',
	'RATE_LIMITED',
	'INTERNAL',
] as const;
