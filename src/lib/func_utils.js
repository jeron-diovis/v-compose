export const curry = (fn, arity = fn.length) => function curried(...args) {
  return args.length >= arity ? fn(...args) : (...nextArgs) => curried(...args, ...nextArgs)
}

function mapValues(obj, fn) {
  return Object.entries(obj).reduce((m, [ k, v ]) => {
    m[k] = fn(v, k)
    return m
  }, {})
}

function pickBy(obj, fn) {
  return Object.entries(obj).reduce((m, [ k, v ]) => {
    if (fn(v, k)) {
      m[k] = v
    }
    return m
  }, {})
}

export function pick(obj, props) {
  return pickBy(obj, (_, k) => props.includes(k))
}

export function omit(obj, props) {
  return pickBy(obj, (_, k) => !props.includes(k))
}

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

export function difference(xs1, xs2) {
  return xs1.filter(x => !xs2.includes(x))
}

export function zipObject(keys, values) {
  return keys.reduce((m, k, i) => {
    m[k] = values[i]
    return m
  }, {})
}
