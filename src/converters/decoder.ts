import {ServiceDef} from '../types'
import {AsyncResult, Result} from '../result'
import {Decoders, DecoderUris} from './index'

type Fn = (...args: any[]) => any
type AsyncFn = (...args: any[]) => AsyncResult<any, any>

type ExtractGenerics<F extends AsyncFn> = F extends AsyncResult<
	infer T,
	infer E
>
	? [T, E]
	: never
type ExtractResultT<F extends Fn> = F extends (
	...args: any[]
) => Promise<Result<infer T, any>>
	? T
	: never
type ExtractResultE<F extends Fn> = F extends (
	...args: any[]
) => Promise<Result<any, infer E>>
	? E
	: never

export type WithDecoder2<
	Service extends ServiceDef<Service>,
	Name extends DecoderUris
> = {
	[K in keyof Service]: (
		...args: Parameters<Service[K]>
	) => Promise<
		ReturnType<
			Decoders<
				ExtractGenerics<Service[K]>[0],
				ExtractGenerics<Service[K]>[1]
			>[Name]['decode']
		>
	>
}
export type WithDecoder<
	Service extends ServiceDef<Service>,
	Name extends DecoderUris
> = {
	[K in keyof Service]: (
		...args: Parameters<Service[K]>
	) => Promise<
		ReturnType<
			Decoders<
				ExtractResultT<Service[K]>,
				ExtractResultE<Service[K]>
			>[Name]['decode']
		>
	>
}

export interface Decoder<T, E, O, Name extends DecoderUris> {
	readonly uri: Name
	decode(result: Result<T, E>): O
}
