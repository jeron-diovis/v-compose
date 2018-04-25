import * as F from "../lib/func_utils"
import { isError } from "../helpers"
import { ERR_NONE } from "../constants"
import { processValidatorResult, SymbolRawFunc } from "./utils"

// ---

const validateValue = F.curry(
  (cfg, value, ...args) => {
    if (typeof cfg === "function" || cfg[SymbolRawFunc] === true) {
      const fn = typeof cfg === "function" ? cfg : cfg.fn
      const result = fn(value, ...args)
      const isValid = !isError(result)
      return processValidatorResult(isValid, result, value, ...args)
    }

    let fn, msg, params

    if (Array.isArray(cfg)) {
      ([ fn, msg, params ] = cfg)
    } else {
      ({ fn, msg, params } = cfg)
    }

    const isValid = fn(value, params, ...args)
    return processValidatorResult(isValid, msg, value, params, ...args)
  }
)

// ---

export const getFirstError = F.curry((validators, value, ...args) => {
  let result = ERR_NONE

  for (const validator of F.values(validators)) {
    result = validateValue(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return result
})

export const getAllErrors = F.curry((validators, value, ...args) => (
  F.filter(
    isError,
    F.map(
      cfg => validateValue(cfg, value, ...args),
      validators
    )
  )
))

export const isValid = F.curry(
  (validators, value) => !isError(getFirstError(validators, value))
)
