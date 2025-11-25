import { AxiosRequestConfig } from './types'

export default {
  method: 'GET',
  timeout: 0,
  adapter: 'xhr',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  validateStatus(status: number) {
    return status >= 200 && status < 300
  }
} as AxiosRequestConfig
