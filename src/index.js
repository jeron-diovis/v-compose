import * as F from "./lib/func_utils"

export const ERR_NONE = undefined;
export const ERR_VALID = null;

export const isError = x => x !== ERR_VALID && x !== ERR_NONE;
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
  switch (result) {
    case ERR_NONE:
      return ERR_NONE;

    case true:
      return ERR_VALID;

    case false:
      return typeof msg === "function" ? msg(...args) : msg;

    default:
      if (result && typeof result.then === "function") {
        console.warn(`
          Your validator seems to return a Promise. 
          You should pass it to 'validate.async' helper instead of just 'validate'.
        `);
      }

      throw new Error("Validator must be a predicate function")
  }
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

  return ERR_NONE
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

  return ERR_NONE
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
