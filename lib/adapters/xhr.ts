import { createError, ErrorCodes } from '@/core/AxiosError'
import { settle } from '@/core/settle'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '@/types'

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined'

export default isXHRAdapterSupported &&
  function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data, headers, timeout, responseType, cancelToken } = config
      const request = new XMLHttpRequest()

      const onCancel = (reason) => {
        reject(reason)
        request.abort()
      }

      const done = () => {
        if (cancelToken) {
          cancelToken.unsubscribe(onCancel)
        }
      }

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

        settle(
          (val) => {
            done()
            resolve(val)
          },
          (err) => {
            reject(err)
            done()
          },
          response
        )
      }

      request.onerror = function () {
        reject(createError('Network Error', config, null, request))
      }

      request.ontimeout = function handleTimeout() {
        reject(
          createError(
            `Timeout of ${timeout}ms exceeded`,
            config,
            ErrorCodes.ERR_TIMEOUT.value,
            request
          )
        )
      }

      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (cancelToken) {
        // 当状态已经改变了就会触发取消的回调

        cancelToken.subscribe(onCancel)
      }

      request.send(data as any)
    })
  }
