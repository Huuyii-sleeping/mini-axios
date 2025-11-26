import { Canceler, CancelExcutor, CancelTokenSource, CancelToken as ICancelToken } from '@/types'
import CancelError from './CancelError'

interface ResolvePromise {
  (reason?: CancelError): void
}

export default class CancelToken implements ICancelToken {
  promise: Promise<CancelError>
  reason?: CancelError

  constructor(executor: CancelExcutor) {
    let ResolvePromise: ResolvePromise
    this.promise = new Promise((resolve) => {
      ResolvePromise = resolve as ResolvePromise
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
