import { isNil } from '@/helpers/is'
import { AxiosInterceptorManager, rejectedFn, ResolvedFn } from '@/types'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: rejectedFn
}

export default class InterceptorManager<T> implements AxiosInterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = []
  }

  use(resolved: ResolvedFn<T>, rejected?: rejectedFn) {
    this.interceptors.push({ resolved, rejected })
    return this.interceptors.length - 1
  }

  eject(id: number) {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }

  forEach(cb: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach((interceptor) => {
      if (!isNil(interceptor)) {
        cb(interceptor!)
      }
    })
  }
}
