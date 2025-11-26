import CancelError from '@/cancel/CancelError'
import { createError, ErrorCodes } from '@/core/AxiosError'
import { settle } from '@/core/settle'
import cookie from '@/helpers/cookie'
import { parseHeaders } from '@/helpers/headers'
import { isFormData } from '@/helpers/is'
import { isURLSameOrigin } from '@/helpers/url'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse, Cancel } from '@/types'

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined'

export default isXHRAdapterSupported &&
  function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      const {
        url,
        method = 'GET',
        data,
        headers,
        timeout,
        responseType,
        cancelToken,
        signal,
        withCredentials,
        xsrfCookieName,
        xsrfHeaderName,
        auth,
        onDownloadProgress,
        onUploadProgress
      } = config
      const request = new XMLHttpRequest()

      // --- process events ---
      const onCancel = (reason?: Cancel) => {
        reject(reason ?? new CancelError('canceled', config, request))
        request.abort()
      }

      const done = () => {
        if (cancelToken) {
          cancelToken.unsubscribe(onCancel)
        }
        if (signal) {
          signal.removeEventListener?.('abort', onCancel)
        }
      }

      request.open(method.toUpperCase(), url!, true)

      request.onreadystatechange = function () {
        // readyState是对象自身的状态（请求处理阶段）
        if (request.readyState !== 4) return
        // status是服务器对应的请求的HTTP响应状态码
        if (request.status === 0) return

        const responseHeaders = request.getAllResponseHeaders()

        const response: AxiosResponse = {
          data: request.response,
          status: request.status,
          statusText: request.statusText,
          headers: parseHeaders(responseHeaders),
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

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }

      // ---- configure request start -----
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }

      // --- process cancel ---
      if (cancelToken || signal) {
        cancelToken && cancelToken.subscribe(onCancel)
        if (signal) {
          signal?.aborted ? onCancel() : signal?.addEventListener?.('abort', onCancel)
        }
      }

      // --- process headers ---
      // 根据是否是表单数据动态调整请求头
      if (isFormData(data)) {
        delete headers!['Content-Type']
      }

      // xsrf攻击
      // 满足下面的说明涉及到cookie的传递 就是发送请求的时候携带一个攻击者访问不到的token
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfVal = cookie.read(xsrfCookieName)
        if (xsrfVal && xsrfHeaderName) {
          headers![xsrfHeaderName] = xsrfVal
        }
      }

      if (auth) {
        headers!['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      Object.keys(headers!).forEach((name) => {
        if (data === null && name.toLocaleLowerCase() === 'content-type') {
          delete headers![name]
        } else {
          request.setRequestHeader(name, headers![name])
        }
      })

      request.send(data as any)
    })
  }
