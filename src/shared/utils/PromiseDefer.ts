type Resolvable<R> = R | PromiseLike<R>;

export interface IPromiseDefer<R> {
  resolve: (thenableOrResult?: Resolvable<R>) => void;
  reject: (error?: any) => void;
  promise: PromiseLike<R>;
}

export class PromiseDefer<R> implements IPromiseDefer<R> {
  constructor() {
    this.promise = new Promise<R>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  resolve: (thenableOrResult?: Resolvable<R>) => void;
  reject: (error?: any) => void;
  promise: PromiseLike<R>;
}
