import {Decoder} from '../converters/decoder'
import {Result} from '../result'

const URI = 'ts-rpc/decoders/identity'
type URI = typeof URI

export class IdentityDecoder<T, E> implements Decoder<T, E, Result<T, E>, URI> {
	readonly uri = URI
	decode = (r: Result<T, E>): Result<T, E> => {
		return r
	}
}

declare module '../converters' {
	interface Decoders<T, E> {
		'ts-rpc/decoders/identity': IdentityDecoder<T, E>
	}
}
