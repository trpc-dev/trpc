import {createServer} from '../../src/server'
import {AsyncResult, ok, err} from '../../src/result'
import {Point, PointService} from './service'

const sleep = (ms: number): Promise<void> =>
	new Promise(resolve => setTimeout(resolve, ms))

class PointServiceImpl implements PointService {
	async dist(p1: Point, p2: Point): AsyncResult<number> {
		if (p1.x < 0) {
			return err('InvalidInput')
		}
		await sleep(1000)
		const diffX = Math.pow(p1.x - p2.x, 2)
		const diffY = Math.pow(p1.y - p2.y, 2)
		return ok(Math.sqrt(diffX + diffY))
	}
}

const server = createServer<PointService>(new PointServiceImpl(), {
	debugMode: true,
})
server.listen(3000, () => {
	console.log('Listening')
})
