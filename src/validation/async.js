import * as F from "../lib/func_utils"
import { isError } from "../helpers"
import { ERR_NONE } from "../constants"
import { processValidatorResult } from "./utils"

// ---

const validateValue = F.curry(
  async (
    [ validator, msg, params ],
    value, ...args
  ) => {
    const isValid = await validator(value, params, ...args)
    return processValidatorResult(isValid, msg, value, params, ...args)
  }
)

// ---

export const getFirstError = F.curry(async (validators, value, ...args) => {
  let result = ERR_NONE

  for (const validator of validators) {
    result = await validateValue(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return result
})

export const getAllErrors = F.curry(async (validators, value, ...args) => (
  (await Promise.all(
    validators.map(cfg => validateValue(cfg, value, ...args))
  ))
  .filter(isError)
))

export const isValid = F.curry(
  async (validators, value) => !isError(await getFirstError(validators, value))
)
