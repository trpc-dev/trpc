import {Decoder} from '../converters/decoder'
import {Result} from '../result'

export class DefaultDecoder<T, E>
	implements Decoder<T, E, Result<T, E>, DefaultDecoder.Uid> {
	readonly uid!: DefaultDecoder.Uid
	decode(r: Result<T, E>): Result<T, E> {
		return r
	}
}

export namespace DefaultDecoder {
	export const Uid = Symbol('trpc/decoders/default')
	export type Uid = typeof Uid
}

declare module '../converters' {
	interface Decoders<T, E> {
		[DefaultDecoder.Uid]: DefaultDecoder<T, E>
	}
}
