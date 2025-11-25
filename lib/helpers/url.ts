import { Params } from '@/types'
import { isArray, isDate, isNil, isPlainObject, isURLSearchParams } from './is'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

/**
 * 将基础的URL进行拼接，生成最终的查询字符串
 * @param url
 * @param params
 * @param paramsSerializer
 * @returns
 */
export function buildURL(
  url: string,
  params?: Params,
  // 用户自定义的处理参数方法
  paramsSerializer?: (params: Params) => string
): string {
  if (!params) return url
  // 最终拼接查询字符串
  let serializedParams: string
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString()
  } else {
    const parts: string[] = []
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (isNil(val)) return
      let values
      if (isArray(val)) {
        values = val
        key += '[]'
      } else {
        values = [val]
      }
      values.forEach((_val) => {
        if (isDate(_val)) {
          _val = _val.toISOString()
        } else if (isPlainObject(_val)) {
          _val = JSON.stringify(_val)
        }
        parts.push(`${encode(key)}=${encode(_val)}`)
      })
    })
    serializedParams = parts.join('&')
  }
  if (serializedParams) {
    const marIndex = url.indexOf('@')
    if (marIndex !== -1) {
      url = url.slice(0, marIndex)
    }
    url += (!url.includes('?') ? '?' : '&') + serializedParams
  }
  return url
}
