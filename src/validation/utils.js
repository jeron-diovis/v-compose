import * as F from "../lib/func_utils"
import { ERR_NONE, ERR_VALID } from "../constants"

export const mapValidators = F.curry((fn, validators, transform) => {
  const newValidators = transform(validators)
  const ret = (...args) => fn(newValidators, ...args)
  ret.map = mapValidators(fn, newValidators)
  return ret
})

export const mappable = fn => function(validators, ...args) {
  if (arguments.length > 1) {
    return fn(validators, ...args)
  }

  const ret = fn.bind(null, validators)
  ret.map = mapValidators(fn, validators)
  return ret
}

export const createValidation = (validateFirst, validateAll, isValid) => validators => ({
  first: validateFirst(validators),
  all: validateAll(validators),
  isValid: isValid(validators),
  map: map => createValidation(validateFirst, validateAll, isValid)(map(validators)),
})


export const processValidatorResult = (result, msg, ...args) => {
  switch (result) {
    case ERR_NONE:
      return ERR_NONE;

    case true:
      return ERR_VALID;

    case false:
      return typeof msg === "function" ? msg(...args) : msg;

    default:
      if (result && typeof result.then === "function") {
        console.warn(`[simple-validation]
          Your validator seems to return a Promise. 
          Use 'validate.async' helper instead of 'validate'.
        `);
      }

      throw new Error(`[simple-validation]
        Validator must return only true, false, or ERR_NONE
      `)
  }
}
