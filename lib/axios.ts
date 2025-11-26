import { Axios } from './core/Axios'
import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from './types'
import defaults from './default'
import { extend } from './helpers'
import mergeConfig from './core/mergeConfig'
import CancelError from './cancel/CancelError'
import CancelToken from './cancel/CancelToken'
import isCancel from './cancel/isCancel'

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
// 标记错误是否是“取消请求”的工具函数
axios.isCancel = isCancel
// 创建“取消令牌”的类 （旧版的取消请求的方法）
axios.CancelToken = CancelToken
// 标识“取消请求”的错误类型/类
axios.CancelError = CancelError

axios.Axios = Axios

export default axios
