import * as F from "../lib/func_utils"
import { ERR_NONE, ERR_VALID } from "../constants"
import Symbol from "es6-symbol"

export const SymbolRawFunc = Symbol("@@v-compose/cfg-raw-func")

const ensureObjectValidators = F.map(x => {
  if (typeof x === "function" || x[SymbolRawFunc] === true) {
    return { fn: x, msg: undefined, params: undefined, [SymbolRawFunc]: true }
  }

  if (Array.isArray(x)) {
    const [ fn, msg, params ] = x
    return { fn, msg, params }
  }

  return x
})


const mapValidators = F.curry((fn, validators, transform) => {
  const newValidators = transform(ensureObjectValidators(validators))
  const ret = fn.bind(null, newValidators)
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
  map: transform => createValidation(validateFirst, validateAll, isValid)(
    transform(ensureObjectValidators(validators))
  ),
})

const DEFAULT_ERROR_MSG = `
  [v-compose] Undefined error message.
  Use explicit empty string, if you want to not display any text. 
`

export const processValidatorResult = (result, msg, ...args) => {
  switch (result) {
    case ERR_NONE:
      return ERR_NONE

    case true:
      return ERR_VALID

    case false:
      if (typeof msg === "function") {
        msg = msg(...args)
      }

      if (msg == null) {
        msg = DEFAULT_ERROR_MSG
      }

      return msg

    default:
      if (result && typeof result.then === "function") {
        console.warn(`[v-compose]
          Your validator seems to return a Promise. 
          Use 'validate.async' helper instead of 'validate'.
        `)
      }

      throw new Error(`[v-compose]
        Validator must return only true, false, or ERR_NONE
      `)
  }
}
