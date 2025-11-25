import { Axios } from './core/Axios'
import { AxiosInstance, AxiosRequestConfig } from './types'

function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)

  return context as AxiosInstance
}

const axios = createInstance({
  method: 'GET',
  headers: {
    'Content-type': 'application/json'
  }, 
  validateStatus(status) {
    return status >= 200 && status < 300
  }
})

export default axios
