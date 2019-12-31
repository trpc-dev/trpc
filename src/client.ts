import {ServiceDef} from './types'
import {DefaultDecoder} from './decoders/default'
import {WithDecoder, Decoder} from './converters/decoder'
import {DecoderUris} from './converters'
import axios from 'axios'

const httpClient = axios.create({
	validateStatus: _ => true,
})

export function createClient<S extends ServiceDef<S>>(address: string) {
	return new ClientBuilder<S>(address)
}

class ClientBuilder<
	S extends ServiceDef<S>,
	DecoderUri extends DecoderUris = DefaultDecoder.Uid
> {
	decoder: Decoder<any, any, any, any> = new DefaultDecoder()

	constructor(private readonly address: string) {}

	withDecoder<T, E, O, Name extends DecoderUris>(
		decoder: Decoder<T, E, O, Name>,
	): ClientBuilder<S, Name> {
		this.decoder = decoder
		return this as any
	}

	/*
	withTransport(): ClientBuilder<S, DecoderUri> {
	}
	*/

	build(): WithDecoder<S, DecoderUri> {
		const stack = [] as string[]
		const proxy = new Proxy(new Function(), {
			get: (target: any, prop: string, receiver: any) => {
				stack.push(prop)
				return proxy
			},
			apply: async (target: any, thisArg: any, args: any[]) => {
				const request = {
					stack,
					args,
				}
				const result = await makeRequest(this.address, request)
				return this.decoder.decode(result)
			},
		}) as any
		return proxy
	}
}

async function makeRequest<T = any>(
	endpoint: string,
	request: {
		args: any[]
		stack: string[]
	},
): Promise<T> {
	const url = endpoint + '/' + request.stack.join('.')
	const {data} = await httpClient.post(url, request, {
		headers: {
			'content-type': 'application/ts-rpc',
			'x-ts-rpc-version': 1,
		},
	})
	return data
}
