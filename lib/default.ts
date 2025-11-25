import { AxiosRequestConfig } from './types'

export default {
  method: 'GET',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  validateStatus(status: number) {
    return status >= 200 && status < 300
  }
} as AxiosRequestConfig
