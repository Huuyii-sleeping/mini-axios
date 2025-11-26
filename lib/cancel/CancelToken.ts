import { Canceler, CancelExcutor, CancelTokenSource, CancelToken as ICancelToken } from '@/types'

interface ResolvePromise {
  (reason?: string): void
}

export default class CancelToken implements ICancelToken {
  promise: Promise<string>
  reason?: string
  constructor(executor: CancelExcutor) {
    let ResolvePromise: ResolvePromise
    this.promise = new Promise((resolve) => {
      ResolvePromise = resolve as ResolvePromise
    })

    // 取消请求，将promise状态从pending到fullfilled
    // 这里executor里面的是传入的参数，调用外部的定义的赋值方法
    executor((message) => {
      if (this.reason) return
      this.reason = message
      ResolvePromise(message)
    })
  }

  throwIfRequested(): void {
    if (this.reason) throw new Error(this.reason)
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
