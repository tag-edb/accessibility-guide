export interface Maybe<T> {
  map<U>(f: (x: T) => U): Maybe<U>;
  map2<U, V>(maybeY: Maybe<U>, f: (x: T, y: U) => V): Maybe<V>;
  andThen<U>(f: (x: T) => Maybe<U>): Maybe<U>;
  oneOf<U>(fs: ((x: T) => Maybe<U>)[]): Maybe<U>;
  orElse<U>(maybeY: Maybe<U>): Maybe<T | U>;
  filter(f: (x: T) => boolean): Maybe<T>;
  withDefault<U>(y: U): T | U;
  toPromise(): Promise<T>;
}

export class Just<T> implements Maybe<T> {
  #value: T;

  constructor(x: T) {
    this.#value = x;
  }

  map<U>(f: (x: T) => U): Just<U> {
    return new Just(f(this.#value));
  }

  map2<U, V>(maybeY: Maybe<U>, f: (x: T, y: U) => V): Maybe<V> {
    return maybeY.andThen((y) => new Just(f(this.#value, y)));
  }

  andThen<U>(f: (x: T) => Maybe<U>): Maybe<U> {
    return f(this.#value);
  }

  oneOf<U>(fs: ((x: T) => Maybe<U>)[]): Maybe<U> {
    return fs.reduce<Maybe<U>>(
      (maybeY, f) => maybeY.orElse(f(this.#value)),
      nothing()
    );
  }

  orElse<U>(_: Maybe<U>): Just<T> {
    return this;
  }

  filter(f: (x: T) => boolean): Maybe<T> {
    return f(this.#value) ? this : new Nothing();
  }

  withDefault<U>(_: U): T {
    return this.#value;
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.#value);
  }
}

export class Nothing<T> implements Maybe<T> {
  map<U>(_: (x: T) => U): Nothing<U> {
    return new Nothing();
  }

  map2<U, V>(_: Maybe<U>, __: (x: T, y: U) => V): Nothing<V> {
    return new Nothing();
  }

  andThen<U>(_: (x: T) => Maybe<U>): Nothing<U> {
    return new Nothing();
  }

  oneOf<U>(_: ((x: T) => Maybe<U>)[]): Nothing<U> {
    return new Nothing();
  }

  orElse<U>(maybeY: Maybe<U>): Maybe<U> {
    return maybeY;
  }

  filter(_: (_: T) => boolean): Nothing<T> {
    return this;
  }

  withDefault<U>(y: U): U {
    return y;
  }

  toPromise(): Promise<never> {
    return Promise.reject();
  }
}

export function from<T>(value: T | null | undefined): Maybe<T> {
  return value === null || value === undefined
    ? new Nothing()
    : new Just(value);
}

export function just<T>(value: T): Just<T> {
  return new Just(value);
}

export function nothing<T>(): Nothing<T> {
  return new Nothing();
}

export function all<O extends Array<Maybe<any>> | Record<string, Maybe<any>>>(
  object: O
): Maybe<{ [K in keyof O]: O[K] extends Maybe<infer V> ? V : never }> {
  return Object.entries(object).reduce<Maybe<any>>(
    (maybeObject, [key, maybeValue]) =>
      maybeObject.map2(maybeValue, (object_, value) => {
        object_[key] = value;
        return object_;
      }),
    new Just(new (object.constructor as { new (): any })())
  );
}
