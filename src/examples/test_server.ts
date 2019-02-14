import {createServer} from '../server'
import {Point, PointService, DistResponse} from './service'

class PointServiceImpl1 implements PointService {
	async dist(p1: Point, p2: Point): Promise<DistResponse> {
		const diffX = Math.pow(p1.x - p2.x, 2)
		const diffY = Math.pow(p1.y - p2.y, 2)
		return {ok: true, value: Math.sqrt(diffX + diffY)}
	}

	async dist2(p1: Point, p2: Point): Promise<DistResponse> {
		const diffX = Math.pow(p1.x - p2.x, 2)
		const diffY = Math.pow(p1.y - p2.y, 2)
		return {ok: true, value: Math.sqrt(diffX + diffY)}
	}
}

const server = createServer<PointService>(new PointServiceImpl1())
server.listen(3000, () => {
	console.log('Listening')
})
