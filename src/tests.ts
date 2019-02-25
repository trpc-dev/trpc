import {FpTsDecoder} from './decoders/fp-ts'
import {PurifyDecoder} from './decoders/purify'
import {IdentityDecoder} from './decoders/identity'
import {DecoderUris} from './converters'
import {WithDecoder, WithDecoder2} from './converters/decoder'
import {ServiceDef} from './types'

export type DefaultErrors = 'ServerError' | 'InvalidInput'
export type Result<T, E> = {ok: true; value: T} | {ok: false; error: E}
export type AsyncResult<T, E = never> = Promise<Result<T, DefaultErrors | E>>
export type UserId = string

interface UserService extends ServiceDef<UserService> {
	createUser(email: string, password: string): AsyncResult<UserId>
}

export const service: UserService = {
	async createUser(email, password) {
		return {ok: true, value: 'aa'}
	},
}

function createClient<Service extends ServiceDef<Service>>(uri: string) {
	return function<Name extends DecoderUris>(decoder: {
		readonly uri: Name
	}): WithDecoder2<Service, Name> {
		return 1 as any
	}
}

const c1 = createClient<UserService>('localhost')

async function main() {
	// fp-ts
	const c2 = c1(new FpTsDecoder())
	const x1 = await c2.createUser('a', 'b')
	x1._tag
	x1.__value
	x1.ok

	// purify-ts
	const c3 = c1(new PurifyDecoder())
	const x2 = await c3.createUser('a', 'b')
	x2._tag
	x2.__value
	x2.ok

	// identity
	const c4 = c1(new IdentityDecoder())
	const x3 = await c4.createUser('a', 'b')
	x3._tag
	x3.__value
	x3.ok
}

main()
