import { ResolvePromise } from './cancel/CancelToken'

export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'delete'
  | 'DELETE'
  | 'put'
  | 'PUT'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'patch'
  | 'PATCH'
export type Params = Record<string, any>

export type IHeaders = Record<string, any>

export interface AxiosRequestConfig {
  method?: Method
  url?: string
  data?: unknown
  params?: Params
  headers?: IHeaders | null | void
  baseURL?: string
  timeout?: number
  responseType?: XMLHttpRequestResponseType
  // 适配器模式 多平台模式 函数是自定义适配器
  adapter?: 'http' | 'xhr' | 'fetch' | ((config: AxiosRequestConfig) => AxiosPromise)

  // 对请求头和请求数据进行自定义的转换 注重数据的转换
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]

  cancelToken?: CancelToken
  signal?: GenericAbortSignal

  // 是否是跨域请求
  withCredentials?: boolean

  // xsrf
  xsrfCookieName?: string
  xsrfHeaderName?: string

  // 配置http请求的相关凭证，目的是让客户端在请求的时候向服务器发送信息，通过服务器的检验
  auth?: AxiosBasicCredentials

  validateStatus?: (status: number) => boolean

  paramsSerializer?: (params: Params) => string

  onDownloadProgress?: (progressEvent: ProgressEvent) => void

  onUploadProgress?: (progressEvent: ProgressEvent) => void

  [k: string]: any
}

export interface AxiosTransformer {
  (this: AxiosRequestConfig, data: any, headers: IHeaders | void | null, status?: number): any
}

export interface GenericAbortSignal {
  readonly aborted: boolean
  onabort?: (...args: any) => any | null
  addEventListener?: (...args: any) => any
  removeEventListener?: (...args: any) => any
}

export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: IHeaders
  config: AxiosRequestConfig
  request: XMLHttpRequest
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export type AxiosErrorCode =
  | 'ERR_BAD_OPTION_VALUE'
  | 'ERR_BAD_OPTION'
  | 'ECONNABORTED'
  | 'ETIMEDOUT'
  | 'ERR_NETWORK'
  | 'ERR_FR_TOO_MANY_REDIRECTS'
  | 'ERR_BAD_RESPONSE'
  | 'ERR_BAD_REQUEST'
  | 'ERR_CANCELED'
  | 'ERR_NOT_SUPPORT'
  | 'ERR_INVALID_URL'
  | 'ERR_TIMEOUT'

export interface AxiosError extends Error {
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: AxiosErrorCode | null
  request?: XMLHttpRequest
  response?: AxiosResponse
}

export interface Axios {
  defaults: AxiosRequestConfig
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }
  getUri: (config?: AxiosRequestConfig) => string
  request: <T = any>(config: AxiosRequestConfig) => AxiosPromise<T>
}

export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  <T = any>(url: string, config: AxiosRequestConfig): AxiosPromise<T>

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>
  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>
  patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>

  postForm<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>
  putForm<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>
  patchForm<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosStatic extends AxiosInstance {
  create: (config?: AxiosRequestConfig) => AxiosInstance
  all: <T>(promises: Array<T | Promise<T>>) => Promise<T[]>
  spread: <T, R>(callback: (...args: T[]) => R) => (arr: T[]) => R
  isCancel: (value: unknown) => value is Cancel
  Axios: AxiosClassStatic
  CancelToken: CancelTokenStatic
  CancelError: CancelStatic
}

export interface AxiosClassStatic {
  new (config: AxiosRequestConfig): Axios
}

export interface AxiosInterceptorManager<T> {
  use: (resolved: ResolvedFn<T>, rejected?: rejectedFn) => number
  eject(id: number): void
}

export interface ResolvedFn<T> {
  (val: T): T | Promise<T>
}

export interface rejectedFn {
  (err: any): any
}

export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  // 发布订阅模式
  subscribe: (listener: ResolvePromise) => void
  unsubscribe: (listener: ResolvePromise) => void
  throwIfRequested(): void
}

export interface CancelTokenStatic {
  new (executor: CancelExcutor): CancelToken
  source: () => CancelTokenSource
}

export interface Canceler {
  (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): void
}

export interface CancelExcutor {
  (cancel: Canceler): void
}

export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

export interface Cancel {
  message?: string
}

export interface CancelStatic {
  new (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): Cancel
}

export interface AxiosBasicCredentials {
  username: string
  password: string
}
