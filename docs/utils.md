# Utils

## API

#### `isError(*): Bool`

#### `hasErrors(Object|Array): Bool`

#### `getErrorValue(Object|Array|*): ValidationResult`

#### `getValidityStatus(Object|Array|*): Bool|undefined`

## Example

#### isError

```js
import * as V from "v-compose"

V.isError("the_message") // => true
V.isError(V.ERR_VALID) // => false
V.isError(V.ERR_NONE) // => false
```

#### hasErrors
```js
import * as V from "v-compose"

V.hasErrors([ "the_message" ]) // => true
V.hasErrors([]) // => false
V.hasErrors([ V.ERR_VALID ]) // => false

V.hasErrors({ some: "the_message" }) // => true
V.hasErrors({}) // => false
V.hasErrors({ some: V.ERR_VALID }) // => false
```

#### getValidityStatus

```js
import * as V from "v-compose"

V.getValidityStatus("some error") // => false
V.getValidityStatus([ V.ERR_VALID, "some error" ]) // => false
V.getValidityStatus([ V.ERR_VALID ]) // => true
V.getValidityStatus([]) // => undefined
// all the same for plain object
```

It's important that it can return `undefined`. Because "there are no errors" and "not yet validated at all" are very different states.

It's especially important for interfaces: most likely, you don't want to show "all is ok" mark when user just opened a form – you wan't it after user did smth to form. 

#### getErrorValue

```js
import * as V from "v-compose"

// for non-collection returns value as is:
V.getErrorValue("some error") // => "some error"

V.getErrorValue([ V.ERR_NONE, V.ERR_VALID, "some error", "some another error" ]) // => "some error"
V.getErrorValue([ V.ERR_NONE, V.ERR_VALID ]) // => V.ERR_VALID
V.getErrorValue([]) // => V.ERR_NONE
// all the same for plain object
```

This is intended to deal with multiple errors from different sources. 

For example, when server-side validation found smth you missed (or can't validate) on client, and you want to show near the field it's own errors and server-side "common" error.
Doing just `errors.field_name || errors.server_error || ...` is not an option, because in this case will be returned either first non-empty value (ignoring, for example, empty string – which technically IS error) or just the latest value in sequence (which can be ERR_NONE while there is ERR_VALID before it).
This helper solves this issue for you.