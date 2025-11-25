// Axios请求配置合并的工具
// 策略模式处理不同配置项的合并逻辑
import { deepMerge } from '@/helpers'
import { isNil, isPlainObject } from '@/helpers/is'
import { AxiosRequestConfig } from '@/types'

interface StratFn {
  (val1: unknown, val2: unknown): any
}

// val2通常是用户配置 val1默认配置
const defaultStrat: StratFn = (val1, val2) => {
  return val2 ?? val1
}

// 优先采用val2的配置 强制覆策略 例如url，params
const fromVal2Strat = (_val1, val2) => {
  if (typeof val2 != null) return val2
}

// 深度合并 适用于headers，auth
// 具有优先级
const deepMergeStrat: StratFn = (val1, val2) => {
  // 用户配置是纯对象
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  }
  // 用户配置非空
  if (!isNil(val2)) {
    return val2
  }
  // 默认配置是纯对象
  if (isPlainObject(val1)) {
    return deepMerge(val1)
  }
  // 兜底使用默认配置
  if (!isNil(val1)) {
    return val1
  }
}

const stratMap = new Map<string, StratFn>([
  ['url', fromVal2Strat],
  ['params', fromVal2Strat],
  ['data', fromVal2Strat],
  ['headers', deepMergeStrat],
  ['auth', deepMergeStrat]
])

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) config2 = {}
  const result = Object.create(null)

  const mergeField = (key: string): void => {
    const strat = stratMap.get(key) ?? defaultStrat
    result[key] = strat(config1[key], config2[key])
  }

  for (const key in config2) {
    mergeField(key)
  }

  for (const key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  return result
}
