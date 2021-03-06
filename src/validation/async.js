import * as F from "../lib/func_utils"
import { isError } from "../helpers"
import { ERR_NONE } from "../constants"
import { processValidatorResult, SymbolRawFunc } from "./utils"

// ---

const validateValue = F.curry(
  async (cfg, value, ...args) => {
    if (typeof cfg === "function" || cfg[SymbolRawFunc] === true) {
      const fn = typeof cfg === "function" ? cfg : cfg.fn
      const result = await fn(value, ...args)
      const isValid = !isError(result)
      return processValidatorResult(isValid, result, value, ...args)
    }

    let fn, msg, params

    if (Array.isArray(cfg)) {
      ([ fn, msg, params ] = cfg)
    } else {
      ({ fn, msg, params } = cfg)
    }

    const isValid = await fn(value, params, ...args)
    return processValidatorResult(isValid, msg, value, params, ...args)
  }
)

// ---

export const getFirstError = F.curry(async (validators, value, ...args) => {
  let result = ERR_NONE

  for (const validator of F.values(validators)) {
    result = await validateValue(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return result
})

export const getAllErrors = F.curry(async (validators, value, ...args) => {
  const result = F.map(
    cfg => validateValue(cfg, value, ...args),
    validators
  )

  for (const [ k, v ] of Object.entries(result)) {
    result[k] = await v
  }

  return F.filter(isError, result)
})

export const isValid = F.curry(
  async (validators, value) => !isError(await getFirstError(validators, value))
)
