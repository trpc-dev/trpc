import {AsyncResult} from './result'
export type ServiceDef<A> = {
	[K in keyof A]: (...args: any) => AsyncResult<any, any>
}
