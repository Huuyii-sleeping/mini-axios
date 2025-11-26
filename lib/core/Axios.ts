import {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Axios as IAxios,
  Method,
  rejectedFn,
  ResolvedFn
} from '@/types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import mergeConfig from './mergeConfig'
import InterceptorManager from './InterceptorManager'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChainNode<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: rejectedFn
}

type PromiseChain<T> = PromiseChainNode<T>[]

export class Axios implements IAxios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
    this._eachMethodNoData()
    this._eachMethodWithData()
  }

  request(url: string | AxiosRequestConfig, config: AxiosRequestConfig = {}): Promise<any> {
    if (typeof url === 'string') {
      config.url = url
    } else {
      config = url
    }

    config = mergeConfig(this.defaults, config)

    const chain: PromiseChain<any> = [
      {
        resolved: dispatchRequest,
        rejected: void 0
      }
    ]
    // 请求拦截器和响应拦截器
    this.interceptors.request.forEach((interceptor) => chain.unshift(interceptor))

    this.interceptors.response.forEach((interceptor) => chain.push(interceptor))

    let promise = Promise.resolve(config) as AxiosPromise<AxiosRequestConfig>

    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  getUri(config?: AxiosRequestConfig): string {
    return transformURL(mergeConfig(this.defaults, config))
  }

  // 加不加data的方法实现不同 进行方法的绑定
  private _eachMethodNoData() {
    ;(['get', 'delete', 'head', 'options'] as Method[]).forEach((method) => {
      ;(Axios.prototype as Record<string, any>)[method] = (
        url: string,
        config: AxiosRequestConfig
      ) => this.request(mergeConfig(config || {}, { method, url }))
    })
  }

  private _eachMethodWithData() {
    ;(['post', 'put', 'patch'] as Method[]).forEach((method) => {
      const getHttpMethod =
        (isForm: boolean) => (url: string, data: unknown, config: AxiosRequestConfig) =>
          this.request(mergeConfig(config || {}), {
            method,
            url,
            data,
            headers: isForm ? { 'Content-type': 'multipart/form-data' } : {}
          })

      ;(Axios.prototype as Record<string, any>)[method] = getHttpMethod(false)
      ;(Axios.prototype as Record<string, any>)[`${method}Form`] = getHttpMethod(true)
    })
  }
}
