import { Axios } from './core/Axios'
import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from './types'
import defaults from './default'
import { extend } from './helpers'
import mergeConfig from './core/mergeConfig'

function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)
  // 这样是为了axios能直接将request使用
  const instance = Axios.prototype.request.bind(context)
  // 静态方法进行绑定 原型方法 get post之类的方法
  extend(instance, Axios.prototype, context)
  // 将一些实例方法放进去，比如config，defaults，interceptors等
  extend(instance, context)
  return instance as AxiosInstance
}

const axios = createInstance(defaults) as AxiosStatic

axios.create = function create(config): AxiosInstance {
  return createInstance(mergeConfig(defaults, config))
}

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

axios.Axios = Axios

export default axios
