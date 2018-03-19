import { ERR_NONE, ERR_VALID } from "./constants"
import * as F from "./lib/func_utils"

// ---

export const isError = x => x !== ERR_VALID && x !== ERR_NONE

isError.not = x => !isError(x)

// ---

export const getErrorValue = x => {
  if (Array.isArray(x) || (x != null && x.constructor === Object)) {
    let hasValidValue = false
    for (const v of F.values(x)) {
      // if there are errors, return first one
      if (isError(v)) {
        return v
      }

      if (v === ERR_VALID && !hasValidValue) {
        hasValidValue = true
      }
    }

    // if no errors, but smth is validated and valid, return "valid" value
    if (hasValidValue) {
      return ERR_VALID
    }

    // nothing is nothing
    return ERR_NONE
  }

  // non-collection values returned as-is
  return x
}

export const getValidityStatus = x => {
  switch (getErrorValue(x)) {
    case ERR_NONE:
      // because "valid" and "not validated yet" is an important difference
      return undefined

    case ERR_VALID:
      return true

    default:
      return false
  }
}

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
