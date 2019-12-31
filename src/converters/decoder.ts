import {ServiceDef} from '../types'
import {Result} from '../result'
import {Decoders, DecoderUris} from './index'

type Fn = (...args: any) => any

type ExtractGenerics<F extends Fn> = ReturnType<F> extends Promise<
	Result<infer T, infer E>
>
	? [T, E]
	: never

export type WithDecoder<
	Service extends ServiceDef<Service>,
	Name extends DecoderUris
> = {
	[K in keyof Service]: Service[K] extends Fn
		? (
				...args: Parameters<Service[K]>
		  ) => Promise<
				ReturnType<
					Decoders<
						ExtractGenerics<Service[K]>[0],
						ExtractGenerics<Service[K]>[1]
					>[Name]['decode']
				>
		  >
		: Service[K] extends ServiceDef<Service[K]>
		? WithDecoder<Service[K], Name>
		: void
}

export interface Decoder<T, E, O, Name extends DecoderUris> {
	readonly uid: Name
	decode(result: Result<T, E>): O
}
