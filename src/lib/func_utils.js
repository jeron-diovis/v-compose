export { default as curry } from "lodash.curry"
export { default as zipObject } from "lodash.zipobject"
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
