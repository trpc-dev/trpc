import {Hook, HookContext, HookResponse} from './index'
/* Adapted from expressjs/cors and jshttp/vary */

/**
 * RegExp to match field-name in RFC 7230 sec 3.2
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 */

const FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

/**
 * Append a field to a vary header.
 *
 * @param {String} header
 * @param {String|Array} field
 * @return {String}
 * @public
 */

function append(header: string, fields: string | string[]): string {
	let fields_ = fields
	if (!Array.isArray(fields)) {
		fields_ = parse(fields)
	}

	// assert on invalid field names
	for (const field of fields_) {
		if (!FIELD_NAME_REGEXP.test(field)) {
			throw new TypeError(
				'field argument contains an invalid header name',
			)
		}
	}

	// existing, unspecified vary
	if (header === '*') {
		return header
	}

	// enumerate current values
	let val = header
	const vals = parse(header.toLowerCase())

	// unspecified vary
	if (fields.indexOf('*') !== -1 || vals.indexOf('*') !== -1) {
		return '*'
	}

	for (const field of fields) {
		const fld = field.toLowerCase()

		// append value (case-preserving)
		if (vals.indexOf(fld) === -1) {
			vals.push(fld)
			val = val ? val + ', ' + field : field
		}
	}

	return val
}

function parse(header: string): string[] {
	var end = 0
	var list = []
	var start = 0

	// gather tokens
	for (let i = 0; i < header.length; i++) {
		switch (header.charCodeAt(i)) {
			case 0x20 /*   */:
				if (start === end) {
					start = end = i + 1
				}
				break
			case 0x2c /* , */:
				list.push(header.substring(start, end))
				start = end = i + 1
				break
			default:
				end = i + 1
				break
		}
	}

	// final token
	list.push(header.substring(start, end))

	return list
}

function vary(res: HookContext['res'], field: string) {
	// get existing header
	let val = res.getHeader('Vary') || ''
	const header = Array.isArray(val) ? val.join(', ') : String(val)

	// set new header
	if ((val = append(header, field))) {
		res.setHeader('Vary', val)
	}
}

function applyHeaders(headers: Header[], res: HookContext['res']) {
	for (const header of headers) {
		if (header) {
			if (header.key === 'Vary' && header.value) {
				vary(res, header.value)
				continue
			}

			res.setHeader(header.key, header.value)
		}
	}
}

interface Header {
	key: string
	value: string
}

function configureOrigin(
	options: CorsOptions,
	req: HookContext['req'],
): Header[] {
	if (options.origin === '*') {
		// Allow any origin
		return [
			{
				key: 'access-control-allow-origin',
				value: '*',
			},
		]
	} else {
		// Fixed origin
		return [
			{
				key: 'access-control-allow-origin',
				value: options.origin,
			},
			{
				key: 'Vary',
				value: 'Origin',
			},
		]
	}
}

function configureAllowedHeaders(
	options: CorsOptions,
	req: HookContext['req'],
): Header[] {
	// var allowedHeaders = options.allowedHeaders || options.headers;
	// let allowedHeaders = []
	// const headers = [];

	// if (!allowedHeaders) {
	// allowedHeaders = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
	// headers.push([{
	//   key: 'Vary',
	//   value: 'Access-Control-Request-Headers'
	// }]);
	// } else if (allowedHeaders.join) {
	//   allowedHeaders = allowedHeaders.join(','); // .headers is an array, so turn it into a string
	// }
	// if (allowedHeaders && allowedHeaders.length) {
	//   headers.push([{
	//     key: 'Access-Control-Allow-Headers',
	//     value: allowedHeaders
	//   }]);
	// }

	return [
		{key: 'vary', value: 'access-control-request-headers'},
		{key: 'access-control-allow-headers', value: '*'},
		{key: 'access-control-allow-methods', value: 'POST, OPTIONS'},
	]
}
interface CorsOptions {
	origin: string
}

export function cors(options: CorsOptions): Hook {
	const fn: Hook = ({req, res}) => {
		let headers = [] as Header[]
		const method = req.method && req.method.toUpperCase()

		if (method === 'OPTIONS') {
			// Preflight
			headers = headers.concat(configureOrigin(options, req))
			headers = headers.concat(configureAllowedHeaders(options, req))

			applyHeaders(headers, res)

			res.statusCode = 204
			res.setHeader('content-length', '0')

			return new HookResponse('')
		}

		// Actual response
		headers = headers.concat(configureOrigin(options, req))
		headers = headers.concat(configureAllowedHeaders(options, req))

		applyHeaders(headers, res)
	}

	return fn
}
