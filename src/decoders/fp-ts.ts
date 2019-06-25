import {Either, left, right} from 'fp-ts/lib/Either'
import {Result} from '../result'
import {Decoder} from '../converters/decoder'

export class FpTsDecoder<T, E>
	implements Decoder<T, E, Either<E, T>, FpTsDecoder.Uri> {
	readonly uri = FpTsDecoder.Uri
	decode(r: Result<T, E>): Either<E, T> {
		if (r.ok) {
			return right(r.value)
		}

		return left(r.error)
	}
}

export namespace FpTsDecoder {
	export const Uri = 'ts-rpc/decoders/fp-ts'
	export type Uri = typeof Uri
}

declare module '../converters' {
	interface Decoders<T, E> {
		[FpTsDecoder.Uri]: FpTsDecoder<T, E>
	}
}
