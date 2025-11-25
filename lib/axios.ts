import { Axios } from './core/Axios'
import { AxiosInstance, AxiosRequestConfig } from './types'
import defaults from './default'
import mergeConfig from './core/mergeConfig'

function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)

  return context as AxiosInstance
}

const axios = createInstance(defaults)

// axios.create = function create(config: AxiosRequestConfig): AxiosInstance {
//   return createInstance(mergeConfig(defaults, config))
// }

export default axios
