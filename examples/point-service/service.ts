import {AsyncResult} from '../../src/result'

export interface Point {
	x: number
	y: number
}

export interface PointService {
	dist(p1: Point, p2: Point): AsyncResult<number>
}
