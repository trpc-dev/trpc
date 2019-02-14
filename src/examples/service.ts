export type DistResponse = {ok: false; error: any} | {ok: true; value: number}

export interface Point {
	x: number
	y: number
}

export interface PointService {
	dist(p1: Point, p2: Point): Promise<DistResponse>
}

export interface GeoService {
	updateCurrentLocation(userId: string, x: number, y: number): Promise<void>
}
