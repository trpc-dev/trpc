import axios from 'axios'
import {err, ok} from './result'

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

export function createClient<A>(remoteAddr: string): A {
	const proxy = new Proxy(
		{},
		{
			get: function(obj, prop, receiver) {
				return (...args: any[]) => {
					const req = {
						fn: prop,
						args: args,
					} as any
					return handleRequest(remoteAddr + '/', req).then(
						(data: any) => {
							if (data.ok) {
								return ok(data.value)
							} else {
								return err(data.error)
							}
						},
					)
				}
			},
		},
	)

	return proxy as A
}
