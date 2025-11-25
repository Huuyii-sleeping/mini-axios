import { isArray, isObject, isUndefined } from './is'

export function toJSONObject<T = object>(obj: T) {
  const stack = Array.from({ length: 10 })

  const visit = (source: T, i: number) => {
    if (isObject(source)) {
      if (stack.includes(source)) return

      if (!('toJSON' in source)) {
        stack[i] = source
        const target: Record<string | number, any> = isArray(source) ? [] : {}
        for (const key in source) {
          const value = (source as Record<string, any>)[key]

          const reducedValue = visit(value, i + 1)
          !isUndefined(reducedValue) && (target[key] = reducedValue)
        }
        stack[i] = void 0
        return target
      }
    }
    return source
  }
  return visit(obj, 0)
}

