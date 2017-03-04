import * as F from "../lib/func_utils"
import { isError } from "../helpers";
import { ERR_NONE } from "../constants";
import { processValidatorResult } from "./utils"

// ---

const validateValue = F.curry(
  (
    [ validator, msg, params ],
    value, ...args
  ) => {
    const isValid = validator(value, params, ...args)
    return processValidatorResult(isValid, msg, value, params, ...args)
  }
);

// ---

export const getFirstError = F.curry((validators, value, ...args) => {
  let result = ERR_NONE

  for (const validator of validators) {
    result = validateValue(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return result
});

export const getAllErrors = F.curry((validators, value, ...args) => (
  validators.map(cfg => validateValue(cfg, value, ...args)).filter(isError)
));

export const isValid = F.curry(
  (validators, value) => !isError(getFirstError(validators, value))
)
