import { AxiosRequestConfig, Axios as IAxios } from '@/types'
import dispatchRequest from './dispatchRequest'

export class Axios implements IAxios {
  defaults: AxiosRequestConfig
  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
  }

  request(url: string | AxiosRequestConfig, config: AxiosRequestConfig = {}): Promise<any> {
    if (typeof url === 'string') { 
      config.url = url
    } else {
      config = url
    }
    return dispatchRequest({
      ...this.defaults,
      ...config
    })
  }
}
