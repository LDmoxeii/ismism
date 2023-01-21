// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>
