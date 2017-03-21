# Utils

## API

#### `isError(Any): Bool`

#### `hasErrors(Object|Array): Bool`

## Example

```js
import * as V from "v-compose"

V.isError("the_message") // => true
V.isError(V.ERR_VALID) // => false
V.isError(V.ERR_NONE) // => false

V.hasErrors([ "the_message" ]) // => true
V.hasErrors([]) // => false
V.hasErrors([ V.ERR_VALID ]) // => false

V.hasErrors({ some: "the_message" }) // => true
V.hasErrors({}) // => false
V.hasErrors({ some: V.ERR_VALID }) // => false
```
