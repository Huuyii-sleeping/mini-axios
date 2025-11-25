import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '@/types'

export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
  return xhr(config)
}

function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, headers } = config
    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    request.onreadystatechange = function () {
      // readyState是对象自身的状态（请求处理阶段） status是服务器对应的请求的HTTP响应状态码
      if (request.readyState !== 4) return
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
      reject(new Error('Network Error'))
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
    reject(new Error(`Request failed with status code ${response.status}`))
  }
}
