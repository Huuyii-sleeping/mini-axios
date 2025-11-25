const typeofTest = (type: string) => (thing: unknown) => typeof thing === type

export const isFunction = typeofTest('function') as (thing: unknown) => thing is Function

export const isString = typeofTest('string') as (thing: unknown) => thing is string

export const isNumber = typeofTest('number') as (thing: unknown) => thing is number

export const isUndefined = typeofTest('undefined') as (thing: unknown) => thing is undefined

// null 也是 object 的类型
export const isObject = (thing: unknown): thing is Object =>
  thing !== null && typeof thing === 'object'

export const isArray = <T = any>(thing: unknown): thing is T[] => Array.isArray(thing)
