import { isFunction } from '@/helpers/is'
import { AxiosPromise, AxiosRequestConfig } from '@/types'

const isFetchSupported = typeof fetch !== 'undefined' && isFunction(fetch)

export default isFetchSupported &&
  function fetchAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((_resolve, reject) => {
      // todo
    })
  }
