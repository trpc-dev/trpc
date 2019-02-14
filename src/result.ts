import * as purify from 'purify-ts/Either'

export type Result<T, E = never> = purify.Either<E, T>

export type AsyncResult<T, E = never> = Promise<
	purify.Either<'InvalidInput' | 'ServerError' | E, T>
>

export function err<E extends string, T = never>(value: E): Result<T, E>
export function err<E, T = never>(value: E): Result<T, E>
export function err<E, T = never>(value: E): Result<T, E> {
	return purify.Left(value)
}

export function ok<T extends string, E = never>(value: T): Result<T, E>
export function ok<T, E = never>(value: T): Result<T, E>
export function ok<T, E = never>(value: T): Result<T, E> {
	return purify.Right(value)
}
