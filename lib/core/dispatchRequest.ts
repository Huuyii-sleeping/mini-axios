import { AxiosRequestConfig, AxiosResponse } from '@/types'
import { buildURL, combineURL, isAbsoluteURL } from '@/helpers/url'
import { flattenHeaders } from '@/helpers/headers'
import adapters from '@/adapters'
import defaults from '@/default'
import { transformData } from './transformData'
import { isArray } from '@/helpers/is'

export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
  // 取消请求
  throwIfCancellationRequested(config)
  processConfig(config)
  const adapter = adapters.getAdapter(config?.adapter || defaults.adapter)
  return adapter(config).then((res: AxiosResponse) => transformResponseData(res))
}

function processConfig(config: AxiosRequestConfig) {
  config.url = transformURL(config)
  config.data = transformData.call(
    config,
    isArray(config.transformRequest) ? config.transformRequest : [config.transformRequest!]
  )
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  const { url, params, baseURL, paramsSerializer } = config
  const fullPath = baseURL && !isAbsoluteURL(url!) ? combineURL(baseURL, url) : url!
  return buildURL(fullPath, params, paramsSerializer)
}

function transformResponseData(res: AxiosResponse) {
  res.data = transformData.call(
    res,
    isArray(res.config.transformResponse)
      ? res.config.transformResponse
      : [res.config.transformResponse!]
  )
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
