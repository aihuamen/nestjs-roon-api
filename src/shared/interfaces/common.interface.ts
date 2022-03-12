export type AnyFunction<Args extends any[], Returned extends unknown> = (
  ...args: Args
) => Returned | undefined;
