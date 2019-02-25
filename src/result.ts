export type DefaultErrors = 'InvalidInput' | 'ServerError'

export type Result<T, E> = {ok: true; value: T} | {ok: false; error: E}
export type AsyncResult<T, E = never> = Promise<Result<T, DefaultErrors | E>>

export function err<E extends string, T = never>(error: E): Result<T, E>
export function err<E, T = never>(error: E): Result<T, E>
export function err<E, T = never>(error: E): Result<T, E> {
	return { ok: false, error }
}

export function ok<T extends string, E = never>(value: T): Result<T, E>
export function ok<T, E = never>(value: T): Result<T, E>
export function ok<E = never>(): Result<void, E>
export function ok<T, E = never>(value?: T): Result<T, E> {
	if (!value) {
		return ({ ok: true, value: undefined } as Result<void, E>) as any
	}
	return { ok: true, value }
}
