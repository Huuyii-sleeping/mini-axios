import xhr from './xhr'
import http from './http'
import fetch from './fetch'
import { AxiosPromise, AxiosRequestConfig } from '@/types'
import { isArray, isFunction, isString } from '@/helpers/is'

const knownAdapters: Record<string, ((config: AxiosRequestConfig) => AxiosPromise) | boolean> = {
  xhr,
  http,
  fetch
}

type Adapter = AxiosRequestConfig['adapter']

export default {
  adapters: knownAdapters,
  getAdapter(adapters: Adapter | Array<Adapter>) {
    adapters = isArray(adapters) ? adapters : [adapters]
    const { length } = adapters
    let nameOrAdapter: Adapter
    let adapter: ((config: AxiosRequestConfig) => AxiosPromise) | boolean | undefined

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i]
      if (
        (adapter = isString(nameOrAdapter)
          ? knownAdapters[nameOrAdapter.toLowerCase()]
          : nameOrAdapter)
      )
        break
    }
    if (!adapter) {
      if (adapter === false) {
        throw new Error(`Adapter ${nameOrAdapter} is not supported by the environment`)
      }
      throw new Error(
        `Unknown adapter ${nameOrAdapter} is specified` +
          `\nWe know these adapters inside in the environment: ${Object.keys(knownAdapters).join(', ')}`
      )
    }
    
    if(!isFunction(adapter)){
        throw new Error('adapter is not a function')
    }

    return adapter
  }
}
