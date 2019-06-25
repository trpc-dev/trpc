export interface Repr {
	1: unknown
	2: unknown
	3: unknown
	4: unknown
	5: unknown
	type: unknown
}

export type Generic<
	TRepr,
	A1,
	A2 = unknown,
	A3 = unknown,
	A4 = unknown
> = TRepr & TypeArgument<A1, A2, A3, A4>

export namespace Generic {
	/**
	 * A marker symbol for associating values of `T<A>` to `Generic<TRepr, A>`.
	 */
	export declare const repr: unique symbol
}

export interface TypeArgument<
	T1 = unknown,
	T2 = unknown,
	T3 = unknown,
	T4 = unknown
> {
	1: T1
	2: T2
	3: T3
	4: T4
}

export interface HasGeneric<T, A1, A2 = unknown, A3 = unknown, A4 = unknown> {
	[Generic.repr]: Generic<T, A1, A2, A3, A4>
}

export type Of<T, A1, A2 = unknown, A3 = unknown, A4 = unknown> = [T] extends [
	Repr
]
	? Generic<T, A1, A2, A3, A4>['type']
	: HasGeneric<T, A1, A2, A3, A4>

class T1<A, B> {}
interface T1_R extends Repr {
	type: T1<this[1], this[2]>
}
type C = OfN<T1_R, ['a']>

type OfN<A, T extends any[]> = T extends [any, any, any, any]
	? Of<A, T[0], T[1], T[2], T[3]>
	: (T extends [any, any, any]
			? Of<A, T[0], T[1], T[2]>
			: (T extends [any, any]
					? Of<A, T[0], T[1]>
					: (T extends [any] ? Of<A, T[0]> : void)))
