import { isArray, isObject, isPlainObject, isUndefined } from './is'

/**
 * 将任意对象/数组装化成JSON兼容的纯对象/数组，核心解决循环引用的问题
 * 适配JSON规范，JSON不支持undefined类型的值，将嵌套的对象/数组变成纯JSON数据结构，确保符合JSON的结构
 * 避免循应用，非JSON值（例如undefined）和深层递归导致的问题
 * @param obj
 * @returns
 */
export function toJSONObject<T = object>(obj: T) {
  // 追踪已经访问的对象，防止循环引用（长度的限制是10）
  const stack = Array.from({ length: 10 })

  const visit = (source: T, i: number) => {
    if (isObject(source)) {
      if (stack.includes(source)) return

      if (!('toJSON' in source)) {
        stack[i] = source
        const target: Record<string | number, any> = isArray(source) ? [] : {}
        for (const key in source) {
          const value = (source as Record<string, any>)[key]

          // 递归处理属性值，深度+1
          const reducedValue = visit(value, i + 1)
          // 不是undefined就赋值到目标对象当中
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

/**
 * 精准高效的获取原来的数据类型，解决了typeof获取类型不准确的问题
 */
export const kindof = ((cache) => (thing: unknown) => {
  const str = toString.call(thing)
  // 性能优化：使用闭包，缓存一个对象，后续同类型的就可以直接使用
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase())
})(Object.create(null))

const { getPrototypeOf } = Object

export function deepMerge(...args: any[]): any {
  const result = Object.create(null)

  const assginValue = (val: unknown, key: string) => {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = deepMerge(result[key], val)
    } else if (isPlainObject(val)) {
      result[key] = deepMerge({}, val)
    } else {
      result[key] = val
    }

    for (let i = 0; i < args.length; i++) {
      const obj = args[i]
      for (let key in obj) {
        assginValue(obj[key], key)
      }
    }
  }
}

export { getPrototypeOf }
