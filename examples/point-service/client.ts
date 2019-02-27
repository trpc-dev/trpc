import {createClient} from '../../src/client'
import {PointService} from './service'

async function main() {
	const client = createClient<PointService>('http://localhost:3000')

	const res = await client.dist({ x: 3, y: 1}, {x:2, y: 2})

	if (res.ok) {
		console.log('OK: ', res.value)
	} else {
		console.log('Error: ', res.error)
	}
}

main()
