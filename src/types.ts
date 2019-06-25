import {AsyncResult} from './result'
export type ServiceDef<S> = {
	[K in keyof S]: S[K] extends (...args: any) => any
		? (...args: any) => AsyncResult<any, any>
		: ServiceDef<S[K]>
}
