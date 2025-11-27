import { createError, ErrorCodes } from '@/core/AxiosError'
import { settle } from '@/core/settle'
import { isFormData, isFunction } from '@/helpers/is'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '@/types'

const isFetchSupported = typeof fetch !== 'undefined' && isFunction(fetch)

export default isFetchSupported &&
  function fetchAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise(async (resolve, reject) => {
      const { url, method = 'GET', data, headers, signal, cancelToken, timeout } = config
      const requestInit: RequestInit = {
        method: method.toUpperCase(),
        headers: headers as HeadersInit,
        body: data as BodyInit
      }

      // body
      if (isFormData(data)) {
        if (headers && headers['Content-Type']) {
          delete headers['Content-Type']
        }
      }

      // cancel request (cancelToken && abortSignal)
      let controller: AbortController | null = null
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController()
        requestInit.signal = controller.signal
      }

      // config.signal 证明已经取消请求
      if (signal && signal.addEventListener) {
        signal.addEventListener('abort', () => {
          controller?.abort()
        })
      }

      if (cancelToken) {
        cancelToken.promise.then((reason) => {
          controller?.abort()
          reject(reason)
        })
      }

      // 处理超时请求
      let timeoutId: NodeJS.Timeout
      if (timeout && timeout > 0) {
        timeoutId = setTimeout(() => {
          controller?.abort()
          reject(
            createError(`Timeout of ${timeout}ms exceeded`, config, ErrorCodes.ERR_TIMEOUT.value)
          )
        }, timeout)
      }

      try {
        // 发送请求
        // ！fetch的URL必须是完整路径或者相对路径
        const response = await fetch(url!, requestInit)
        if (timeoutId!) clearTimeout(timeoutId)

        const responseData = await response.text()
        let resultData: any = responseData
        try {
          resultData = JSON.parse(responseData)
        } catch (error) {
          // 保持text的结果
        }
        const responseHeaders: Record<string, any> = {}
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val
        })
        const axiosResponse: AxiosResponse = {
          data: resultData,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          config,
          request: requestInit as any
        }
        // 结算 赋值promise结果
        settle(resolve, reject, axiosResponse)
      } catch (error: any) {
        if (timeoutId!) clearTimeout(timeoutId)
        // 对取消错误还是网络错误进行区分
        if (error.name !== 'AbortError') {
          reject(createError('Network Error', config, ErrorCodes.ERR_NETWORK.value))
        }
      }
    })
  }
