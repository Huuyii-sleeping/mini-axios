import { createError, ErrorCodes } from '@/core/AxiosError'
import { settle } from '@/core/settle'
import { kindof } from '@/helpers'
import { isString } from '@/helpers/is'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '@/types'
import http from 'http'
import https from 'https'

const isHttpAdapterSupported = typeof process !== 'undefined' && kindof(process) === 'process'

export default isHttpAdapterSupported &&
  function httpAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data, headers, timeout, cancelToken } = config
      if (!url) {
        reject(createError('URL is required', config, ErrorCodes.ERR_INVALID_URL.value))
        return
      }

      // 解析url
      const parseUrl = new URL(url)
      const protocol = parseUrl.protocol === 'https:' ? https : http
      const options: http.RequestOptions | https.RequestOptions = {
        method: method.toUpperCase(),
        headers: headers as http.OutgoingHttpHeaders,
        hostname: parseUrl.hostname,
        port: parseUrl.port,
        path: parseUrl.pathname + parseUrl.search,
        timeout: timeout
      }

      // 创建request
      const req = protocol.request(options, (res) => {
        const responseStream = res
        const responseBuffer: Buffer[] = []
        // 创建chunk
        responseStream.on('data', (chunk) => {
          responseBuffer.push(chunk)
        })
        // 接收结束
        responseStream.on('end', () => {
          const buffer = Buffer.concat(responseBuffer)
          let responseData: any = buffer.toString('utf-8')

          if (res.headers['content-type']?.includes('application/json')) {
            try {
              responseData = JSON.parse(responseData)
            } catch (error) {}
          }

          const response: AxiosResponse = {
            data: responseData,
            status: res.statusCode!,
            statusText: res.statusMessage || '',
            headers: res.headers,
            config,
            request: req as any
          }

          settle(resolve, reject, response)
        })
      })

      req.on('error', (_err) => {
        if (req.aborted) return
        reject(createError('Network Error', config, ErrorCodes.ERR_NETWORK.value, req as any))
      })

      if (timeout) {
        req.on('timeout', () => {
          req.destroy()
          reject(
            createError(
              `Timeout of ${timeout}ms exceeded`,
              config,
              ErrorCodes.ERR_TIMEOUT.value,
              req as any
            )
          )
        })
      }

      if (cancelToken) {
        cancelToken.promise.then((reason) => {
          req.destroy()
          reject(reason)
        })
      }

      if (data) {
        if (isString(data) || Buffer.isBuffer(data)) {
          req.write(data)
        } else if (typeof data === 'object') {
          req.write(JSON.stringify(data))
        }
      }

      req.end()
    })
  }
