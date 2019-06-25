import {Decoder} from '../converters/decoder'
import {Result} from '../result'

export class DefaultDecoder<T, E>
	implements Decoder<T, E, Result<T, E>, DefaultDecoder.URI> {
	readonly uri = DefaultDecoder.URI
	decode(r: Result<T, E>): Result<T, E> {
		return r
	}
}

export namespace DefaultDecoder {
	export const URI = 'ts-rpc/decoders/default'
	export type URI = typeof URI
}

declare module '../converters' {
	interface Decoders<T, E> {
		'ts-rpc/decoders/default': DefaultDecoder<T, E>
	}
}
