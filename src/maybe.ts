export interface Maybe<T> {
  map<U>(f: (x: T) => U): Maybe<U>;
  andThen<U>(f: (x: T) => Maybe<U>): Maybe<U>;
  map2<U, V>(maybeY: Maybe<U>, f: (x: T, y: U) => V): Maybe<V>;
}

class Just<T> implements Maybe<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  map<U>(f: (x: T) => U): Maybe<U> {
    return new Just(f(this.#value));
  }

  andThen<U>(f: (x: T) => Maybe<U>): Maybe<U> {
    return f(this.#value);
  }

  map2<U, V>(maybeY: Maybe<U>, f: (x: T, y: U) => V): Maybe<V> {
    return maybeY.andThen((y) => new Just(f(this.#value, y)));
  }
}

class Nothing<T> implements Maybe<T> {
  map<U>(_: (x: T) => U): Maybe<U> {
    return new Nothing();
  }

  andThen<U>(_: (x: T) => Maybe<U>): Maybe<U> {
    return new Nothing();
  }

  map2<U, V>(_: Maybe<U>, __: (x: T, y: U) => V): Maybe<V> {
    return new Nothing();
  }
}

export function from<T>(value: T | null | undefined): Maybe<T> {
  return value === null || value === undefined
    ? new Nothing()
    : new Just(value);
}

export function just<T>(value: T): Maybe<T> {
  return new Just(value);
}

export function nothing<T>(): Maybe<T> {
  return new Nothing();
}

export function all<O extends Array<Maybe<any>> | Record<string, Maybe<any>>>(
  object: O
): Maybe<{ [K in keyof O]: O[K] extends Maybe<infer V> ? V : never }> {
  const blank = just(
    new (object.constructor as {
      new (): { [K in keyof O]: O[K] extends Maybe<infer V> ? V : never };
    })()
  );
  return (Object.entries(object) as [keyof O, Maybe<any>][]).reduce(
    (maybeObject, [key, maybeValue]) =>
      maybeObject.map2(maybeValue, (object_, value) => {
        object_[key] = value;
        return object_;
      }),
    blank
  );
}
