type PromiseWithResolversFn = <T>(
  this: PromiseConstructor,
) => {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

export function ensurePdfPolyfills(): void {
  const PromiseCtor = Promise as PromiseConstructor & {
    withResolvers?: PromiseWithResolversFn;
  };
  if (typeof PromiseCtor.withResolvers !== "function") {
    PromiseCtor.withResolvers = function withResolvers<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

ensurePdfPolyfills();
