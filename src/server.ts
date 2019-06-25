import * as http from 'http'
import {Hook, AfterHook} from './hooks'
import {debugHook} from './hooks/debug'

function runHooks(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	hooks: Hook[],
): AfterHook[] {
	const afterHooks = [] as AfterHook[]
	for (const hook of hooks) {
		afterHooks.push(
			hook({
				req,
				res,
			}),
		)
	}
	return afterHooks
}

function error({
	req,
	res,
	err,
	debugMode,
	msg,
}: {
	req: http.IncomingMessage
	res: http.ServerResponse
	err?: any
	debugMode?: boolean
	msg?: string
}) {
	res.statusCode = 400

	if (debugMode) {
		if (msg) {
			console.log(msg)
		}
		if (err) {
			console.log(err)
		}
	}

	if (err instanceof TypeError) {
		res.end(JSON.stringify({ok: false, error: 'InvalidInput'}))
	} else {
		res.end(JSON.stringify({ok: false, error: 'ServerError'}))
	}
	req.connection.destroy()
	return
}

function invalid(req: http.IncomingMessage, res: http.ServerResponse) {
	res.statusCode = 400
	res.end('Invalid request\n')
	req.connection.destroy()
	return
}

const rpcHandler = <A>(service: A, debugMode: boolean, hooks: Hook[]) =>
	async function handler(
		req: http.IncomingMessage & {body: any},
		res: http.ServerResponse,
	) {
		const tsRpcVersion = req.headers['x-ts-rpc-version']
		const contentType = req.headers['content-type']
		if (
			tsRpcVersion !== '1' ||
			contentType !== 'application/ts-rpc' ||
			req.method !== 'POST'
		) {
			return invalid(req, res)
		}

		const bufs = [] as Buffer[]
		let byteSize = 0
		for await (const chunk of req) {
			byteSize += chunk.length

			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (byteSize > 1e6) {
				return invalid(req, res)
			}

			bufs.push(chunk)
		}

		try {
			const bodyString = Buffer.concat(bufs, byteSize).toString('utf8')
			const body = JSON.parse(bodyString)
			req.body = body
			const {stack, args} = body
			const afterHooks = runHooks(req, res, hooks)

			let fn = (service as any)[stack[0]]
			for (let i = 1; i < stack.length; i++) {
				fn = fn[stack[i]]
			}
			if (!fn.isExposed) {
				return error({
					req,
					res,
					err: undefined,
					debugMode,
					msg: `Function ${stack.join('.')} is not defined`,
				})
			}

			const answer = await fn(...args).catch((err: any) => {
				error({req, res, err, debugMode, msg: 'Service function error'})
			})
			res.end(JSON.stringify(answer))

			afterHooks.forEach(hook => hook({req, res}))
		} catch (err) {
			return error({
				req,
				res,
				err,
				debugMode,
				msg: 'Error while parsing JSON',
			})
		}
	}

export function expose(
	target: any,
	key: string,
	descriptor: PropertyDescriptor,
): void {
	target[key].isExposed = true
}

type CreateServerOptions = {debugMode?: boolean; hooks?: Hook[]}
export function createServer<S>(
	service: S,
	{debugMode = false, hooks = [debugHook]}: CreateServerOptions = {},
): http.Server {
	const server = http.createServer(rpcHandler(service, debugMode, hooks))

	return server
}
