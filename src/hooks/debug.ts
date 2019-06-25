import {Hook} from './index'
import uuidv4 from 'uuid/v4'
import Hri = require('human-readable-ids')
const {hri} = Hri

export const debugHook: Hook = ctx => {
	const start = new Date().getTime()
	let fnCall = ctx.req as any
	fnCall = fnCall.body.stack.join('.')
	const hrid = hri.random()

	return ctx => {
		const end = new Date().getTime()
		console.log(`[${hrid}] ${fnCall} (took ${end - start}ms)`)
		// console.log('Time taken for request in ms:', end - start)
	}
}
