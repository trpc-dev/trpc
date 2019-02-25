import {Either, left, right} from 'fp-ts/lib/Either'
import {Result} from '../result'
import {Decoder} from '../converters/decoder'

const URI = 'ts-rpc/decoders/fp-ts'
type URI = typeof URI
export class FpTsDecoder<T, E> implements Decoder<T, E, Either<E, T>, URI> {
	readonly uri = URI
	decode(r: Result<T, E>): Either<E, T> {
		if (r.ok) {
			return right(r.value)
		}

		return left(r.error)
	}
}

declare module '../converters' {
	interface Decoders<T, E> {
		'ts-rpc/decoders/fp-ts': FpTsDecoder<T, E>
	}
}
