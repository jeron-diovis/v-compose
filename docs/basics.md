# Basics

## API

#### `validate(ValidatorsList, value [, ...args]): ValidationResult`

#### `validateAll(ValidatorsList, value [, ...args]): Array.<Error> | Object.<String, Error>`

#### `isValid(ValidatorsList, value [, ...args]): Bool`

---

#### ValidatorsList :: Array.<ValidatorConfig> | Object.<String, ValidatorConfig>

#### ValidatorConfig :: Array.<Predicate, ErrorMsg [, Params]> | { fn: Predicate, msg: ErrorMsg [, params: Params] } | CustomValidator

#### CustomValidator :: Function (value [, ...args]) -> ValidationResult

#### Predicate :: Function (value, Params [, ...args]) -> Bool | ERR_NONE

#### ErrorMsg :: Error | Function (value, Params [, ...args]) -> Error

#### Params :: Any

#### Error :: String

#### ValidationResult :: Error | ERR_VALID | ERR_NONE

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


const isValid = V.isValid(cfg)

isValid(3) // => false
```

## Details

### Currying

Each helper is curried (with arity of 2).
 
```js
import * as V from "v-compose"

V.validate(cfg, value, ...args)

const validate = V.validate(cfg)
validate(value, ...args)
```

### Named validators

it is allowed to define `ValidatorsList` as object instead of array. 

In this case `validateAll` helper will also return an object with keys corresponding to failed validators:
 
```js
import * as V from "v-compose"

const validate = V.validateAll({
  positive: [ x => x > 0, "not positive" ],
  even: [ x => x % 2 === 0, "not even" ],
})

validate(-1) // => { positive: "not positive", even: "not even" }

validate(1) // => { even: "not even" }

validate(2) // => {}
```

### Validator params

`Params` are not required, but even if they are not defined, they will be passed to predicate and msg functions as second argument.

This is done mostly for usage with 3-party libs like [this one](https://www.npmjs.com/package/validator). It would be nice to have a library of curried validators with params-first signatures, but so far I didn't found anything similar.  

```js
import * as V from "v-compose"

const validate = V.validate([
  [
    (...args) => console.log("predicate params:", ...args),
    (...args) => console.log("msg params:", ...args),
    { some_param: 42 }
  ]
])

V.validate("the_value", "extra_arg_1", "extra_arg_2")

// => predicate params: "the_value", { some_param: 42 }, "extra_arg_1", "extra_arg_2"
// => msg params: "the_value", { some_param: 42 }, "extra_arg_1", "extra_arg_2"
```

### Validation result

Validator is something that is supposed to return an error message.

If value is valid, it should return an "absence of error". For this purpose there is an `ERR_VALID` constant:

```js
import * as V from "v-compose"
const isValid = V.validate(cfg, value) === V.ERR_VALID
```

### Skipping validators

In some cases we may want to omit particular validator depending on validated value.
 
This is why it is allowed for `Predicate` function to return not just boolean, but also `ERR_NONE` constant – which represents absence of any validation result:
 
```js
V.validate([
  [
    file => {
      if (file != null) {
        return file.size <= MAX_FILE_SIZE
      }
      
      return V.ERR_NONE 
    },
    "file is too big"
  ]
])
```

If `Predicate` returns `ERR_NONE`, validation result also will be `ERR_NONE`. 

If each validator in validators list has returned `ERR_NONE`, the entire validation result also will be `ERR_NONE`.
 
So, returning to example above:

```js
import * as V from "v-compose"
const result = V.validate(cfg, value)
const isValid = result === V.ERR_VALID || result === V.ERR_NONE
```

This is what `isValid` helper actually does.

### Async validation

Use `.async` version of helper – which is able to deal with Promises:

```js
V.validate.async([
  [ 
    x => fetch(`/some/api?q=${encodeURIComponent(x)}`).then(r => r.ok), 
    "error message" 
  ]
])
```

Same is true for `validateAll` and `isValid`. 

Note that for validators, passed to sync version of helpers, it is explicitly denied to return a Promise:
 
```js
const validate = V.validate([
  [ (...) => new Promise(...), "..." ]
])

validate(...)

// [v-compose]
// Your validator seems to return a Promise. 
// Use 'validate.async' helper instead of 'validate'.
//
// Uncaught Error: [v-compose] Validator must return only true, false, or ERR_NONE
```

### Modifying partially applied helpers

Sometimes we may need to modify a bit previously created validator: change error message, add some skip condition, etc.

One of solutions is to store validators configs separately, so it is possible to import them where you need, modify and then create new validators. But it's inconvenient, it makes us to deal with two entities in code – validator function and it's config, while we're actually interested only in function.

So, instead, each partially applied helper provides a `.map` method. It accepts a callback, which receives a `ValidatorsList`, passed to that helper, and returns a new `ValidatorsList`.

**[!]** Each particular `ValidatorConfig` in list will be represented as object `{ fn: Predicate, msg: ErrorMsg, params: Params }` instead of array. This is done to simplify updates and make code more readable: updating `config.msg` is obviously more clear, then updating `config[1]`.  

With named validators it's especially convenient:

```js
import * as V from "v-compose"

import omit from "lodash/fp/omit"
import set from "lodash/fp/set"
import update from "lodash/fp/update"
import wrap from "lodash/fp/wrap"

const v1 = V.validateAll({
  integer: [ x => parseInt(x) === x, "not integer" ],
  positive: [ x => x > 0, "not positive" ],
  even: [ x => x % 2 === 0, "not even" ],
})

v1(-1) // => [ "not positive", "not even" ]

const v2 = v1
  .map(omit([ "even" ]))
  .map(set("positive.msg", x => `${x} is not positive`))
  .map(update("integer.fn", wrap((origin, value, ...args) => {
    if (Number.isNaN(value)) {
      return false
    }
    return origin(value, ...args)
  })))
  
v2(-1) // => [ "-1 is not positive" ]
```