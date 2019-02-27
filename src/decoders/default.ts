import {Decoder} from '../converters/decoder'
import {Result} from '../result'

const URI = 'ts-rpc/decoders/default'
type URI = typeof URI

export class DefaultDecoder<T, E> implements Decoder<T, E, Result<T, E>, URI> {
	readonly uri = URI
	decode(r: Result<T, E>): Result<T, E> {
		return r
	}
}

declare module '../converters' {
	interface Decoders<T, E> {
		'ts-rpc/decoders/default': DefaultDecoder<T, E>
	}
}
