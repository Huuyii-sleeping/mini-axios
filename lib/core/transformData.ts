import defaults from '@/default'
import { AxiosRequestConfig, AxiosResponse, AxiosTransformer } from '@/types'

/**
 * 给transformRequest和transformResponse的统一的入口文件
 * @param this
 * @param fns
 * @param response
 * @returns
 */
export function transformData(
  this: AxiosRequestConfig,
  fns: AxiosTransformer[],
  response?: AxiosResponse
) {
  const config = this || defaults
  const context = response || config
  const headers = config.headers

  let data = context.data

  fns.forEach((fn) => {
    data = fn.call(config, data, headers, response ? response.status : void 0)
  })

  return data
}
