import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '@/types'
import { createError, ErrorCodes } from './AxiosError'
import { buildURL, combineURL, isAbsoluteURL } from '@/helpers/url'
import { flattenHeaders } from '@/helpers/headers'

export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
  processConfig(config)
  return xhr(config)
}

function processConfig(config: AxiosRequestConfig) {
  config.url = transformURL(config)
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  const { url, params, baseURL, paramsSerializer } = config
  const fullPath = baseURL && !isAbsoluteURL(url!) ? combineURL(baseURL, url) : url!
  return buildURL(fullPath, params, paramsSerializer)
}

function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, headers } = config
    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    request.onreadystatechange = function () {
      // readyState是对象自身的状态（请求处理阶段）
      if (request.readyState !== 4) return
      // status是服务器对应的请求的HTTP响应状态码
      if (request.status === 0) return
      const response: AxiosResponse = {
        data: request.response,
        status: request.status,
        statusText: request.statusText,
        headers: headers ?? {},
        config,
        request
      }

      settle(resolve, reject, response)
    }

    request.onerror = function () {
      reject(createError('Network Error', config, null, request))
    }

    request.send(data as any)
  })
}

function settle(
  resolve: (value: AxiosResponse) => void,
  reject: (reason: any) => void,
  response: AxiosResponse
): void {
  const validateStatus = response.config.validateStatus
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response)
  } else {
    reject(
      createError(
        `Request failed with status code ${response.status}`,
        response.config,
        [ErrorCodes.ERR_BAD_REQUEST.value, ErrorCodes.ERR_BAD_RESPONSE.value][
          Math.floor(response.status / 100) - 4
        ],
        response.request,
        response
      )
    )
  }
}
