import {Either, Left, Right} from 'purify-ts/Either'
import {Decoder} from '../converters/decoder'
import {Result} from '../result'

const URI = 'ts-rpc/decoders/purify'
type URI = typeof URI

export class PurifyDecoder<T, E> implements Decoder<T, E, Either<E, T>, URI> {
	readonly uri = URI as URI
	decode(r: Result<T, E>): Either<E, T> {
		if (r.ok) {
			return Right(r.value)
		}

		return Left(r.error)
	}
}
declare module '../converters' {
	interface Decoders<T, E> {
		'ts-rpc/decoders/purify': PurifyDecoder<T, E>
	}
}
