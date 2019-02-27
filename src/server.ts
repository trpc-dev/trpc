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

function error(req: http.IncomingMessage, res: http.ServerResponse, err?: any) {
	res.statusCode = 400

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
	function handler(req: http.IncomingMessage, res: http.ServerResponse) {
		const tsRpcVersion = req.headers['x-ts-rpc-version']
		const contentType = req.headers['content-type']

		if (typeof tsRpcVersion !== 'string' || tsRpcVersion !== '1')
			return invalid(req, res)
		if (
			typeof contentType !== 'string' ||
			contentType !== 'application/ts-rpc'
		)
			return invalid(req, res)
		if (req.method !== 'POST') return invalid(req, res)

		const bufs = [] as Buffer[]
		let byteSize = 0

		req.on('data', function(chunk) {
			byteSize += chunk.length

			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (byteSize > 1e6) {
				req.connection.destroy()
				return
			}

			bufs.push(chunk)
		})

		req.on('end', function() {
			try {
				const bodyString = Buffer.concat(bufs, byteSize).toString(
					'utf8',
				)
				const body = JSON.parse(bodyString)
				const {fn, args} = body
				const afterHooks = runHooks(req, res, hooks)
				;(service as any)
					[fn](...args)
					.then((answer: any) => {
						res.end(JSON.stringify(answer))
					})
					.catch((err: any) => {
						if (debugMode) {
							console.error('Service function error')
							console.error(err)
						}
						error(req, res, err)
					})
					.then(() => {
						afterHooks.forEach(hook => hook({req, res}))
					})
			} catch (err) {
				if (debugMode) {
					console.error('Error while parsing JSON')
					console.error(err)
				}
				return error(req, res, err)
			}
		})
	}

type CreateServerOptions = {debugMode?: boolean; hooks?: Hook[]}
export function createServer<A>(
	service: A,
	{debugMode = false, hooks = [debugHook]}: CreateServerOptions = {},
): http.Server {
	const server = http.createServer(rpcHandler(service, debugMode, hooks))

	return server
}
