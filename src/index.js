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

const processSingleValidatorResult = (result, msg, ...args) => {
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
};

// ---

const validateValue = F.curry(
  (
    [ validator, msg, params ],
    value, ...args
  ) => {
    const isValid = validator(value, params, ...args);
    return processSingleValidatorResult(isValid, msg, value, params, ...args);
  }
);

const getFirstError = F.curry((validators, value, ...args) => {
  for (const validator of validators) {
    const result = validateValue(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return ERR_VALID
});

const getAllErrors = F.curry((validator, value, ...args) => (
  validator.map(cfg => validateValue(cfg, value, ...args)).filter(isError)
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
    return processSingleValidatorResult(isValid, msg, value, params, ...args);
  }
);


const getFirstErrorAsync = F.curry(async (validators, value, ...args) => {
  for (const validator of validators) {
    const result = await validateValue.async(validator, value, ...args)
    if (isError(result)) {
      return result
    }
  }

  return ERR_VALID
});

const getAllErrorsAsync = F.curry(async (validators, value, ...args) => (
  (await Promise.all(
    validators.map(cfg => validateValue.async(cfg, value, ...args))
  ))
  .filter(isError)
));

validate.async = paired(getFirstErrorAsync, getAllErrorsAsync)

isValid.async = F.curry(async (validators, value) => !isError(await validate.async(validators, value)))

validation.async = createValidation(validate.async, validate.async.all, isValid.async);

// ---

const processSchemeValidatorResult = result => {
  if (result && typeof result.then === "function") {
    console.warn(`[simple-validation :: scheme]
      One of validators in your scheme seems to return a Promise. 
      Use 'scheme.async' helper instead of 'scheme'.
    `);

    throw new Error(`[simple-validation :: scheme]
      Validators in sync scheme must not return a Promise 
    `)
  }

  return result
};

const validateScheme = (scheme, data, ...args) => {
  const keys = Object.keys(scheme)
  const values = keys.map(k => {
    const validator = scheme[k]
    const field = data[k]
    const result = validator(field, data, ...args)
    return processSchemeValidatorResult(result)
  })
  return F.zipObject(keys, values)
}

validateScheme.async = async (scheme, data, ...args) => {
  const keys = Object.keys(scheme)
  const values = await Promise.all(keys.map(k => {
    const validator = scheme[k]
    const field = data[k]
    return validator(field, data, ...args)
  }))
  return F.zipObject(keys, values)
}


const schemeFieldsValidator = (validateScheme, scheme) => function(props, ...args) {
  if (!Array.isArray(props)) {
    throw new Error("[simple-validation :: scheme.fields] 'props' must be an Array")
  }

  const unexistingKeys = F.difference(props, Object.keys(scheme))
  if (unexistingKeys.length > 0) {
    throw new Error(`[simple-validation :: scheme.fields]
      Following keys are not defined in scheme:
      ${unexistingKeys.join(", ")}
    `)
  }

  const subScheme = F.pick(scheme, props)

  return arguments.length === 1
    ? (...args) => validateScheme(subScheme, ...args)
    : validateScheme(subScheme, ...args)
}


const schemeSingleFieldValidator = scheme => function(prop, ...args) {
  if (!scheme.hasOwnProperty(prop)) {
    throw new Error(`[simple-validation :: scheme.field]
      Key '${prop}' is not defined is scheme
    `)
  }

  const validate = scheme[prop]
  return arguments.length === 1 ? validate : validate(...args)
}


const createSchemeValidator = validateScheme => function(scheme, ...args) {
  if (arguments.length > 1) {
    return validateScheme(scheme, ...args)
  }

  // ---

  const ret = (...args) => validateScheme(scheme, ...args)
  ret.fields = schemeFieldsValidator(validateScheme, scheme)
  ret.just = schemeSingleFieldValidator(scheme)
  return ret
}

export const scheme = createSchemeValidator(validateScheme)
scheme.async = createSchemeValidator(validateScheme.async)
