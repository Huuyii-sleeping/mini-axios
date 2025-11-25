import { getPrototypeOf, kindof } from '.'

const ObjToString = Object.prototype.toString

const typeofTest = (type: string) => (thing: unknown) => typeof thing === type

export const isFunction = typeofTest('function') as (thing: unknown) => thing is Function

export const isString = typeofTest('string') as (thing: unknown) => thing is string

export const isNumber = typeofTest('number') as (thing: unknown) => thing is number

export const isUndefined = typeofTest('undefined') as (thing: unknown) => thing is undefined

// null 也是 object 的类型
export const isObject = (thing: unknown): thing is Object =>
  thing !== null && typeof thing === 'object'

export const isArray = <T = any>(thing: unknown): thing is T[] => Array.isArray(thing)

export const isNil = (thing: unknown): boolean => thing == null

export function isDate(thing: unknown): thing is Date {
  return ObjToString.call(thing) === '[object Date]'
}

export function isPlainObject(thing: unknown): boolean {
  if (kindof(thing) !== 'object') {
    return false
  }
  const prototype = getPrototypeOf(thing)
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in (thing as Object)) &&
    !(Symbol.iterator in (thing as Object))
  )
}

export function isURLSearchParams(thing: unknown): thing is URLSearchParams {
  return typeof thing !== 'undefined' && thing instanceof URLSearchParams
}
