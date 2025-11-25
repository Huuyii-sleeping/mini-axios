import { AxiosRequestConfig } from '@/types'
import { buildURL, combineURL, isAbsoluteURL } from '@/helpers/url'
import { flattenHeaders } from '@/helpers/headers'
import adapters from '@/adapters'
import defaults from '@/default'

export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
  processConfig(config)
  const adapter = adapters.getAdapter(config?.adapter || defaults.adapter)
  return adapter(config)
}

function processConfig(config: AxiosRequestConfig) {
  config.url = transformURL(config)
  //   config.data = transform(config)
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  const { url, params, baseURL, paramsSerializer } = config
  const fullPath = baseURL && !isAbsoluteURL(url!) ? combineURL(baseURL, url) : url!
  return buildURL(fullPath, params, paramsSerializer)
}
