import mapValues from "lodash.mapvalues"
import pickBy from "lodash.pickby"
import curry from "lodash.curry"

export { curry }
export { default as zipObject } from "lodash.zipobject"
export { default as entries } from "lodash.topairs"
export { default as pick } from "lodash.pick"
export { default as omit } from "lodash.omit"
export { default as difference } from "lodash.difference"

export const values = x => {
  if (x == null) {
    return []
  }

  if (Array.isArray(x)) {
    return x
  }

  return Object.keys(x).map(k => x[k])
}

export const map = curry((fn, x) =>
  Array.isArray(x) ? x.map(fn) : mapValues(x, fn))

export const filter = curry((fn, x) =>
  Array.isArray(x) ? x.filter(fn) : pickBy(x, fn))
