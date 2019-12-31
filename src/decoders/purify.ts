import {Either, Left, Right} from 'purify-ts/Either'
import {Decoder} from '../converters/decoder'
import {Result} from '../result'

export class PurifyDecoder<T, E>
	implements Decoder<T, E, Either<E, T>, PurifyDecoder.Uid> {
	readonly uid!: PurifyDecoder.Uid
	decode(r: Result<T, E>): Either<E, T> {
		if (r.ok) {
			return Right(r.value)
		}

		return Left(r.error)
	}
}

export namespace PurifyDecoder {
	export const Uid = Symbol('trpc/decoders/purify')
	export type Uid = typeof Uid
}

declare module '../converters' {
	interface Decoders<T, E> {
		[PurifyDecoder.Uid]: PurifyDecoder<T, E>
	}
}
