import * as http from 'http'

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

const rpcHandler = <A>(service: A, debugMode: boolean) =>
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
				const body = Buffer.concat(bufs, byteSize).toString('utf8')
				const {fn, args} = JSON.parse(body) as any
				if (debugMode) {
					console.log(`[+] ${fn}:`, args)
				}
				;(service as any)
					[fn](...args)
					.then((answer: any) => {
						let json
						if (answer.isRight()) {
							json = {ok: true, value: answer.extract()}
						} else {
							json = {ok: false, error: answer.extract()}
						}
						res.end(JSON.stringify(json))
					})
					.catch((err: any) => {
						if (debugMode) {
							console.error('Service function error')
							console.error(err)
						}
						error(req, res, err)
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

type CreateServerOptions = {debugMode?: boolean}
export function createServer<A>(
	service: A,
	{debugMode = false}: CreateServerOptions,
): http.Server {
	const server = http.createServer(rpcHandler(service, debugMode))

	return server
}
