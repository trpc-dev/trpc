import * as http from 'http'
import {Hook, AfterHook, HookResponse} from './hooks'
import {logHook} from './hooks/log'

function runHooks(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	hooks: Hook[],
): AfterHook[] | HookResponse {
	const afterHooks = [] as AfterHook[]
	for (const hook of hooks) {
		const hookResult = hook({req, res})
		if (hookResult instanceof HookResponse) {
			return hookResult
		}
		if (typeof hookResult === 'function') {
			afterHooks.push(hookResult)
		}
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
		const trpcVersion = req.headers['x-trpc-version']
		const contentType = req.headers['content-type']
		if (
			trpcVersion !== '1' ||
			contentType !== 'application/trpc' ||
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
			const afterHooksOrResponse = runHooks(req, res, hooks)
			if (afterHooksOrResponse instanceof HookResponse) {
				res.end(afterHooksOrResponse.body)
				return
			}

			let fn = (service as any)[stack[0]]
			for (let i = 1; i < stack.length; i++) {
				fn = fn[stack[i]]
			}
			if (!isExposed(service, fn)) {
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

			afterHooksOrResponse.forEach(hook => hook({req, res}))
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

const EXPOSED_METHODS_SYMBOL = Symbol('exposedMethods')

export function expose(
	target: any,
	key: string,
	descriptor: PropertyDescriptor,
): void {
	if (target[EXPOSED_METHODS_SYMBOL] === undefined) {
		target[EXPOSED_METHODS_SYMBOL] = new Set()
	}
	target[EXPOSED_METHODS_SYMBOL].add(key)
}

function isExposed(target: any, fn: Function) {
	return target[EXPOSED_METHODS_SYMBOL].has(fn.name)
}

type CreateServerOptions = {debugMode?: boolean; hooks?: Hook[]}
export function createServer<S>(
	service: S,
	{debugMode = false, hooks = [logHook]}: CreateServerOptions = {},
): http.Server {
	const server = http.createServer(rpcHandler(service, debugMode, hooks))

	return server
}
