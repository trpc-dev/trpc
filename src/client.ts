import axios from 'axios'
import {err, ok} from './result'
import {ServiceDef} from './types'
import {DecoderUris} from './converters'
import {Decoder} from './converters/decoder'

type RpcRequest<A, Fn extends keyof A> = {
	fn: Fn
	args: ExtractArgs<A[Fn]>
}

type ExtractArgs<T> = T extends (...args: infer A) => any ? A : never

const client = axios.create({
	validateStatus: _ => true,
})

async function handleRequest<A, Fn extends keyof A>(
	endpoint: string,
	request: RpcRequest<A, Fn>,
): Promise<A[Fn]> {
	const {data} = await client.post(
		endpoint,
		{
			fn: request.fn,
			args: request.args,
		},
		{
			headers: {
				'content-type': 'application/ts-rpc',
				'x-ts-rpc-version': 1,
			},
		},
	)
	return data
}

type CreateClientOptions<T, E, O, Name extends DecoderUris> = {
	address: string
	decoder?: Decoder<T, E, O, Name>
}
export function createClient<
	A extends ServiceDef<A>,
	T = never,
	E = never,
	O = never,
	Name extends DecoderUris = never
>({address, decoder}: CreateClientOptions<T, E, O, Name>): A {
	const proxy = new Proxy<A>({} as A, {
		get(obj, prop, receiver) {
			return async (...args: any[]) => {
				const req = {
					fn: prop,
					args: args,
				} as any
				const result = (await handleRequest(address + '/', req)) as any
				if (result.ok) {
					return ok(result.value)
				} else {
					return err(result.error)
				}
			}
		},
	})

	return proxy
}
