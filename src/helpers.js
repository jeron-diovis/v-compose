import { ERR_NONE, ERR_VALID } from "./constants"

// ---

export const isError = x => x !== ERR_VALID && x !== ERR_NONE

isError.not = x => !isError(x)

// ---

export const hasErrors = obj => {
  if (obj == null) {
    return false
  }

  for (const k of Object.keys(obj)) {
    const v = obj[k]

    if (isError(v)) {
      return true
    }

    if (Array.isArray(v)) {
      return v.some(isError)
    }
  }

  return false
}

hasErrors.not = x => !hasErrors(x)
