# Scheme validation

`scheme` helper validates an object key-to-key against given scheme.

## API

#### `scheme(Scheme, data [, ...args]): ValidationResult`

---

#### Scheme :: Object.<String, ValidatorFunction>

## Example

```js
import * as V from "v-compose"

const requiredValidator = [
  x => x != null, "this field is required"
]

const validate = V.scheme({
  email: V.validate([
    requiredValidator,
    [ isEmail, "invalid email" ],
  ]),
  
  username: V.validate([
    requiredValidator,
    [ x => x.length <= 255, "string is too long" ]
  ]),
})

validate({
  email: "foo"
}) 
// => { email: "invalid email", username: "this field is required" }

validate({
  email: "foo@bar.baz",
  username: "John"
}) // => {}
```

## Details

### Async validation

Just like other helpers, `scheme` has [`.async`](/docs/basics.md#async-validation) version.

For validators in sync scheme it is not allowed to return a Promise:

```js
V.scheme({
  foo: V.validate.async([
    [ (...) => new Promise(...), "..." ]
  ])
})

// [v-compose :: scheme]
// One of validators in your scheme seems to return a Promise. 
// Use 'scheme.async' helper instead of 'scheme'.

// Uncaught Error: [v-compose :: scheme] Validators in sync scheme must not return a Promise
```

### Currying

Just like other helpers, `scheme` is [`curried`](/docs/basics.md#currying).

### Modifying created scheme

Just like other helpers, partially applied `scheme` has [`.map`](/docs/basics.md#modifying-partially-applied-helpers) method.

```js
import * as V from "v-compose"

import set from "lodash/fp/set"

const validate = V.scheme({
  email: V.validate([
    [ isEmail, "invalid email" ],
  ])
})

validate.map(scheme => ({ 
  ...scheme,
  email: scheme.email.map(set("0.msg", x => `'${x}' is not a valid email`)),
  
  username: V.validate([
    [ x => x.length <= 255, "string is too long" ]
  ]),
}))
```

### Validating subset of scheme fields

```js
import * as V from "v-compose"

const fooValidator = V.validate(...)

const validate = V.scheme({
  foo: fooValidator,
  bar: ...,
  baz: ...,
})

// include only listed fields
const validateFooBar = validate.fields([ "foo", "bar" ]) 
validateFooBar(...) // => { foo: "...", bar: "..." }

// exclude listed fields
validate.fields.omit([ "foo" ], ...) // => { bar: "...", baz: "..." }

// validate a single field, returning it's result only;
// exactly the same as calling `fooValidator` directly
const validateJustFoo = validate.just("foo") 
validateJustFoo(...) // => just_error_message_for_foo_field

// undefined fields
validate.fields([ "foo", "bla" ]) 
// => Uncaught Error: [v-compose :: scheme.fields] Following keys are not defined in scheme: bla
```
