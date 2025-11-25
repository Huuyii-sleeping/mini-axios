import { kindof } from '@/helpers'
import { AxiosPromise, AxiosRequestConfig } from '@/types'

const isHttpAdapterSupported = typeof process !== 'undefined' && kindof(process) === 'process'

export default isHttpAdapterSupported &&
  function httpAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((_resolve, _reject) => {
      // todo
    })
  }
