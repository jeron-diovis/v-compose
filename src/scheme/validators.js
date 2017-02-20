import * as F from "../lib/func_utils"

// ---


const processSyncSchemeValidatorResult = result => {
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
}


// ---


export const sync = F.curry((scheme, data, ...args) => {
  const keys = Object.keys(scheme)
  const values = keys.map(k => {
    const validator = scheme[k]
    const field = data[k]
    const result = validator(field, data, ...args)
    return processSyncSchemeValidatorResult(result)
  })
  return F.zipObject(keys, values)
})


export const async = F.curry(async (scheme, data, ...args) => {
  const keys = Object.keys(scheme)
  const values = await Promise.all(keys.map(k => {
    const validator = scheme[k]
    const field = data[k]
    return validator(field, data, ...args)
  }))
  return F.zipObject(keys, values)
})
