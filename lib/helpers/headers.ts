import { IHeaders, Method } from '@/types'
import { deepMerge } from '.'

export function flattenHeaders(
  headers: IHeaders | undefined | null,
  method: Method
): IHeaders | undefined | null {
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
