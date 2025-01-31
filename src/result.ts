export interface Result<E, T> {
  map<U>(f: (x: T) => U): Result<E, U>;
  map2<U, V>(resultY: Result<E, U>, f: (x: T, y: U) => V): Result<E, V>;
  andThen<U>(f: (x: T) => Result<E, U>): Result<E, U>;
  oneOf<U>(fs: ((x: T) => Result<E, U>)[]): Result<E, U>;
  orElse<U>(resultY: Result<E, U>): Result<E, T | U>;
  filter(e: E, f: (x: T) => boolean): Result<E, T>;
  withDefault<U>(y: U): T | U;
  toPromise(): Promise<T>;
}

export class Ok<E, T> implements Result<E, T> {
  #value: T;

  constructor(x: T) {
    this.#value = x;
  }

  map<U>(f: (x: T) => U): Ok<E, U> {
    return new Ok(f(this.#value));
  }

  map2<U, V>(resultY: Result<E, U>, f: (x: T, y: U) => V): Result<E, V> {
    return resultY.andThen((y) => new Ok(f(this.#value, y)));
  }

  andThen<U>(f: (x: T) => Result<E, U>): Result<E, U> {
    return f(this.#value);
  }

  oneOf<U>(fs: ((x: T) => Result<E, U>)[]): Result<E, U> {
    return fs.reduce<Result<E, U>>(
      (resultY, f) => resultY.orElse(f(this.#value)),
      err(undefined as E) //BAD
    );
  }

  orElse<U>(_: Result<E, U>): Ok<E, T> {
    return this;
  }

  filter(e: E, f: (x: T) => boolean): Result<E, T> {
    return f(this.#value) ? this : new Err(e);
  }

  withDefault<U>(_: U): T {
    return this.#value;
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.#value);
  }
}

export class Err<E, T> implements Result<E, T> {
  #value: E;

  constructor(e: E) {
    this.#value = e;
  }

  map<U>(_: (x: T) => U): Err<E, U> {
    return new Err(this.#value);
  }

  map2<U, V>(_: Result<E, U>, __: (x: T, y: U) => V): Err<E, V> {
    return new Err(this.#value);
  }

  andThen<U>(_: (x: T) => Result<E, U>): Err<E, U> {
    return new Err(this.#value);
  }

  oneOf<U>(_: ((x: T) => Result<E, U>)[]): Err<E, U> {
    return new Err(this.#value);
  }

  orElse<U>(resultY: Result<E, U>): Result<E, U> {
    return resultY;
  }

  filter(_: E, __: (_: T) => boolean): Err<E, T> {
    return this;
  }

  withDefault<U>(y: U): U {
    return y;
  }

  toPromise(): Promise<never> {
    return Promise.reject(this.#value);
  }
}

export function from<E, T>(e: E, value: T | null | undefined): Result<E, T> {
  return value === null || value === undefined ? new Err(e) : new Ok(value);
}

export function ok<E, T>(value: T): Ok<E, T> {
  return new Ok(value);
}

export function err<E, T>(e: E): Err<E, T> {
  return new Err(e);
}

export function all<
  O extends Array<Result<any, any>> | Record<string, Result<any, any>>
>(
  object: O
): Result<
  any,
  { [K in keyof O]: O[K] extends Result<any, infer V> ? V : never }
> {
  return Object.entries(object).reduce<Result<any, any>>(
    (resultObject, [key, resultValue]) =>
      resultObject.map2(resultValue, (object_, value) => {
        object_[key] = value;
        return object_;
      }),
    new Ok(new (object.constructor as { new (): any })())
  );
}
