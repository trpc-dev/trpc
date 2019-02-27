import * as http from 'http'

export interface Hook {
	(ctx: HookContext): AfterHook // | HookResponse
}

export class HookResponse {
	constructor(public readonly body: any) {}

	toJSON() {
		return JSON.stringify(this.body)
	}
}

export interface AfterHook {
	(ctx: HookContext): void //| HookResponse
}

export interface HookContext {
	req: http.IncomingMessage
	res: http.ServerResponse
}
