# v-compose

> ### A set of helpers for combining validators
 
Inspired by [this article](https://medium.com/javascript-inside/form-validation-as-a-higher-order-component-pt-1-83ac8fd6c1f0).

This lib only cares about **combining** validators. It does does not provide any ready-to-use validator functions like `isEmail`, `isRequired`, etc. For these purposes you may use other libs, like [this one](https://www.npmjs.com/package/validator).  

## install

`npm i -S v-compose`

## Example

```js
import * as V from "v-compose"


const validate = V.validate([
  [ x => x > 0, "not positive" ],
  [ 
    x => x % 2 === 0, 
    x => `'${x}' is not even` 
  ],
])

validate(0) // => "not positive"
validate(1) // => "'1' is not even"


const cfg = [
  x => x !== 3 ? V.ERR_VALID : "value is equal 3",
  validate,
]

const validateAll = V.validateAll(cfg)

validateAll(3) // => [ "value is equal 3", "'3' is not even" ]
validateAll(2) // => []


const isValid = V.isValid(cfg)

isValid(3) // => false
```

## Docs:

* [basics](/docs/basics.md)
* [validation object](/docs/validation-object.md)
* [scheme](/docs/scheme.md)
* [utils](/docs/utils.md)

## License 

MIT