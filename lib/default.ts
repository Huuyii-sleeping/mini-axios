import { processHeaders } from './helpers/headers'
import { transformRequest, transformResponse } from './helpers/transform'
import { AxiosRequestConfig } from './types'

export default {
  method: 'GET',
  timeout: 0,
  adapter: 'xhr',
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  transformRequest: [
    function (data, headers) {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    function (data) {
      return transformResponse(data)
    }
  ],
  validateStatus(status: number) {
    return status >= 200 && status < 300
  }
} as AxiosRequestConfig
