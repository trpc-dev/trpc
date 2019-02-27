import {Hook} from './index'

export const debugHook: Hook = ctx => {
	const start = new Date().getTime()

	return ctx => {
		const end = new Date().getTime()
		console.log('Time taken for request in ms:', end - start)
	}
}
