import {
  AxiosErrorCode,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError as IAxiosError
} from '@/types'
import { isFunction } from '@/helpers/is'
import { toJSONObject } from '@/helpers'

export default class AxiosError extends Error implements IAxiosError {
  isAxiosError: boolean

  constructor(
    message: string,
    public code: AxiosErrorCode | null,
    public config: AxiosRequestConfig,
    public request?: XMLHttpRequest,
    public response?: AxiosResponse
  ) {
    super(message)

    // Node环境下，可以使用Error.captureStackTrace方法
    if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      // 浏览器环境
      this.stack = new Error(message).stack
    }

    this.isAxiosError = true
    // 用来继承一些内置的对象
    Object.setPrototypeOf(this, AxiosError.prototype)
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      code: this.code,
      status: (this.response && this.response.status) ?? null,
      config: toJSONObject(this.config)
    }
  }
}

const descriptors: Record<string, { value: AxiosErrorCode }> = {}
;[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL'
].forEach((code) => {
  descriptors[code as AxiosErrorCode] = { value: code as AxiosErrorCode }
})

Object.defineProperties(AxiosError, descriptors)

function createError(
  message: string,
  config: AxiosRequestConfig,
  code: AxiosErrorCode | null,
  request?: XMLHttpRequest,
  response?: AxiosResponse
) {
  return new AxiosError(message, code, config, request, response)
}

export { createError, descriptors as ErrorCodes }
