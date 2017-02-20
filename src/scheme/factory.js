import * as F from "../lib/func_utils"

// ---


const forSingleField = scheme => function(prop, ...args) {
  if (!scheme.hasOwnProperty(prop)) {
    throw new Error(`[simple-validation :: scheme.just]
      Key '${prop}' is not defined is scheme
    `)
  }

  const validate = scheme[prop]
  return arguments.length === 1 ? validate : validate(...args)
}


// ---


const forFieldsList = (validateScheme, scheme, omitMode = false) => function(props, ...args) {
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

  const take = omitMode ? F.omit : F.pick
  const subScheme = take(scheme, props)

  return arguments.length === 1
    ? validateScheme.bind(null, subScheme)
    : validateScheme(subScheme, ...args)
}


// ---


const createSchemeValidator = validateScheme => function(scheme, ...args) {
  if (arguments.length > 1) {
    return validateScheme(scheme, ...args)
  }

  // ---

  const ret = validateScheme.bind(null, scheme)
  ret.fields = forFieldsList(validateScheme, scheme, false)
  ret.fields.omit = forFieldsList(validateScheme, scheme, true)
  ret.just = forSingleField(scheme)
  ret.map = map => createSchemeValidator(validateScheme)(map(scheme))
  return ret
}


export default createSchemeValidator
