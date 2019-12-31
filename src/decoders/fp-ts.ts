import {Either, left, right} from 'fp-ts/lib/Either'
import {Result} from '../result'
import {Decoder} from '../converters/decoder'

export class FpTsDecoder<T, E>
	implements Decoder<T, E, Either<E, T>, FpTsDecoder.Uid> {
	readonly uid!: FpTsDecoder.Uid
	decode(r: Result<T, E>): Either<E, T> {
		if (r.ok) {
			return right(r.value)
		}

		return left(r.error)
	}
}

export namespace FpTsDecoder {
	export const Uid = Symbol('trpc/decoders/fp-ts')
	export type Uid = typeof Uid
}

declare module '../converters' {
	interface Decoders<T, E> {
		[FpTsDecoder.Uid]: FpTsDecoder<T, E>
	}
}
