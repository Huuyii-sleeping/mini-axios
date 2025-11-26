import { IHeaders, Method } from '@/types'
import { deepMerge } from '.'
import { isPlainObject } from './is'

const ignoreDuplicateOf = new Set([
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent'
])

export function parseHeaders(rawHeaders: string): IHeaders {
  let parsed = Object.create(null)
  if (!rawHeaders) return parsed

  rawHeaders.split('\n').forEach(function parser(line) {
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()

    if (!key || (parsed[key] && ignoreDuplicateOf.has(key))) {
      return
    }
    const val = vals.join(':').trim()

    if (key === 'set-cookie') {
      if (parsed[key]) {
        parsed[key].push(val)
      } else {
        parsed[key] = [val]
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val
    }
  })

  return parsed
}

export function processHeaders(
  headers: IHeaders | void | null,
  data: unknown
): IHeaders | void | null {
  norimalizeHeaderName(headers, 'Content-Type')
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

function norimalizeHeaderName(headers: IHeaders | void | null, norimalizeName: string) {
  if (!headers) return
  Object.keys(headers).forEach((name) => {
    if (name !== norimalizeName && name.toUpperCase() === norimalizeName.toUpperCase()) {
      headers[norimalizeName] = headers[name]
      delete headers[name]
    }
  })
}

export function flattenHeaders(
  headers: IHeaders | void | null,
  method: Method
): IHeaders | void | null {
  if (!headers) {
    return headers
  }
  headers = deepMerge(headers.common, headers[method], headers)

  const methodToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  // 已经进行合并了就可以删除了
  methodToDelete.forEach((method) => {
    delete headers![method]
  })
  return headers
}
