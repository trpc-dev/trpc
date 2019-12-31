import * as http from 'http'

export interface Hook {
	(ctx: HookContext): AfterHook | HookResponse | void
}

export class HookResponse {
	constructor(public readonly body: any) {}
}

export interface AfterHook {
	(ctx: HookContext): void //  HookResponse
}

export interface HookContext {
	req: http.IncomingMessage
	res: http.ServerResponse
}

/* Re-export hooks */
export * from './log'
export * from './cors'
