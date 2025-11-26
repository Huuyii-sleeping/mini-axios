import { Canceler, CancelExcutor, CancelTokenSource, CancelToken as ICancelToken } from '@/types'
import CancelError from './CancelError'

export interface ResolvePromise {
  (reason?: CancelError): void
}

export default class CancelToken implements ICancelToken {
  promise: Promise<CancelError>
  reason?: CancelError

  private _listeners?: Array<ResolvePromise>

  constructor(executor: CancelExcutor) {
    let ResolvePromise: ResolvePromise
    this.promise = new Promise((resolve) => {
      ResolvePromise = resolve as ResolvePromise
    })

    this.promise.then((cancel) => {
      if (!this._listeners) return

      for (const listener of this._listeners) {
        listener(cancel)
      }

      this._listeners = void 0
    })

    // 取消请求，将promise状态从pending到fullfilled
    // 这里executor里面的是传入的参数，调用外部的定义的赋值方法
    executor((message, config, request) => {
      if (this.reason) return
      this.reason = new CancelError(message, config, request)
      ResolvePromise(this.reason)
    })
  }

  throwIfRequested(): void {
    if (this.reason) throw this.reason
  }

  subscribe(listener: ResolvePromise) {
    if (this.reason) {
      listener(this.reason)
      return    
    }
    if (this._listeners) {
      this._listeners.push(listener)
    } else {
      this._listeners = [listener]
    }
  }

  unsubscribe(listener: ResolvePromise) {
    if (!this._listeners) return
    const idx = this._listeners.indexOf(listener)
    if (idx !== -1) {
      this._listeners.splice(idx, 1)
    }
  }

  // 静态方法直接封装就行
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken((c) => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
