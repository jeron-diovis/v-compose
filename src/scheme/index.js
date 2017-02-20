import create from "./factory"
import * as validators from "./validators"

const scheme = create(validators.sync)
scheme.async = create(validators.async)

export default scheme
