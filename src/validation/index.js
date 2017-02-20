import { mappable, createValidation } from "./utils"
import * as Sync from "./sync"
import * as Async from "./async"

const validate = mappable(Sync.getFirstError)
const validateAll = mappable(Sync.getAllErrors)
const isValid = mappable(Sync.isValid)
const validation = createValidation(validate, validateAll, isValid)

validate.async = mappable(Async.getFirstError)
validateAll.async = mappable(Async.getAllErrors)
isValid.async = mappable(Async.isValid)
validation.async = createValidation(validate.async, validateAll.async, isValid.async)

export { validate, validateAll, isValid, validation }

export default validation
