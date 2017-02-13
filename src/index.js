import * as F from "./lib/func_utils"

export const ERROR_NOT_VALIDATED = undefined;
export const ERROR_VALID = null;

export const isError = x => x !== ERROR_VALID && x !== ERROR_NOT_VALIDATED;
isError.not = x => !isError(x);

// ---

const paired = (single, all) => {
  const fn = single;
  fn.all = all;
  return fn;
};

const createValidation = (validate, validateAll, isValid) => validators => ({
  validate: paired(
    validate(validators),
    validateAll(validators)
  ),
  isValid: isValid(validators),
})

// ---

const _processResult = (result, msg, ...args) => {
  if (result === ERROR_NOT_VALIDATED) {
    return ERROR_NOT_VALIDATED;
  }

  if (result === true) {
    return ERROR_VALID; // need exactly null, not undefined. Undefined means that value wasn't validated at all
  }

  if (result !== false) {
    throw new Error("Validator must be a predicate function")
  }

  if (typeof msg === "function") {
    return msg(...args);
  }

  return msg;
};

// ---

const validateValue = F.curry(
  (
    [ validator, msg, params ],
    value, ...args
  ) => {
    const isValid = validator(value, params, ...args);
    return _processResult(isValid, msg, value, params, ...args);
  }
);

const getFirstError = F.curry((validators, value, ...args) => {
  for (const validator of validators) {
    const error = validateValue(validator, value, ...args)
    if (isError(error)) {
      return error
    }
  }

  return ERROR_NOT_VALIDATED
});

const getAllErrors = F.curry((validator, value) => (
  validator.map(params => validateValue(params, value)).filter(isError)
));

export const validate = paired(getFirstError, getAllErrors);

export const isValid = F.curry((validators, value) => !isError(validate(validators, value)));

export const validation = createValidation(validate, validate.all, isValid);


// ---


validateValue.async = F.curry(
  async (
    [ validator, msg, params ],
    value, ...args
  ) => {
    const isValid = await validator(value, params, ...args);
    return _processResult(isValid, msg, value, params, ...args);
  }
);


const getFirstErrorAsync = F.curry(async (validators, value, ...args) => {
  for (const validator of validators) {
    const error = await validateValue.async(validator, value, ...args)
    if (isError(error)) {
      return error
    }
  }

  return ERROR_NOT_VALIDATED
});

const getAllErrorsAsync = F.curry((validators, value) => (
  Promise.all(
    validators.map(validator => validateValue.async(validator, value))
  )
  .then(xs => xs.filter(isError))
));

validate.async = paired(getFirstErrorAsync, getAllErrorsAsync)

isValid.async = F.curry(async (validators, value) => !isError(await validate.async(validators, value)))

validation.async = createValidation(validate.async, validate.async.all, isValid.async);

// ---

const validateScheme = (scheme, data) => {
  const keys = Object.keys(scheme)
  const values = keys.map(k => scheme[k](data[k], data))
  return F.zipObject(keys, values)
}

validateScheme.async = async (scheme, data) => {
  const keys = Object.keys(scheme)
  const values = await Promise.all(keys.map(k => scheme[k](data[k], data)))
  return F.zipObject(keys, values)
}

const createSchemeValidator = validateScheme => function(scheme, data) {
  if (arguments.length === 1) {
    const ret = data => validateScheme(scheme, data)
    ret.only = F.curry((props, data) => validateScheme(F.pick(scheme, props), data))
    return ret
  }

  return validateScheme(scheme, data)
}

export const scheme = createSchemeValidator(validateScheme)
scheme.async = createSchemeValidator(validateScheme.async)
