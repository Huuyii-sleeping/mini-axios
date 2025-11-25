import { AxiosResponse } from "@/types"
import { createError, ErrorCodes } from "./AxiosError"

export function settle(
  resolve: (value: AxiosResponse) => void,
  reject: (reason: any) => void,
  response: AxiosResponse
): void {
  const validateStatus = response.config.validateStatus
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response)
  } else {
    reject(
      createError(
        `Request failed with status code ${response.status}`,
        response.config,
        [ErrorCodes.ERR_BAD_REQUEST.value, ErrorCodes.ERR_BAD_RESPONSE.value][
          Math.floor(response.status / 100) - 4
        ],
        response.request,
        response
      )
    )
  }
}