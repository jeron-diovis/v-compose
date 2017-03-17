import * as F from "../lib/func_utils"
import { isError } from "../helpers"
import { ERR_NONE } from "../constants"
import { processValidatorResult } from "./utils"

// ---

const validateValue = F.curry(
  async (cfg, value, ...args) => {
    if (typeof cfg === "function") {
      const result = await cfg(value, ...args)
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

export const getAllErrors = F.curry(async (validators, value, ...args) => (
  (await Promise.all(
    F.values(validators).map(cfg => validateValue(cfg, value, ...args))
  ))
  .filter(isError)
))

export const isValid = F.curry(
  async (validators, value) => !isError(await getFirstError(validators, value))
)
