# Validation object

Validation object uses config to create and group [all other helpers](/docs/basics.md).

## API

#### `validation(ValidatorsList): ValidationObject`

---

#### ValidationObject :: { first: Function, all: Function, isValid: Function, map: Function }

## Example 

```js
import * as V from "simple-validation"


const validation = V.validation([
  [ x => x > 0, "not positive" ],
  [ x => x % 2 === 0, "not even" ],
])

validation.first(0) // => "not positive"
validation.all(-1) // => [ "not positive", "is not even" ]
validation.isValid(-1) // => false
```

## Details

Just like other helpers, `validation` has [`.async`](/docs/basics.md#async-validation) version.

Just like other helpers, validation object has [`.map`](/docs/basics.md#modifying-partially-applied-helpers) method to update already created functions.
