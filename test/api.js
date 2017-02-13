import * as APP from "../src"

describe("basics", () => {
  it("api", () => {
    assert.isFunction(APP.isError, "isError")
    assert.isFunction(APP.isError.not, "isError.not")

    assert.property(APP, "ERROR_NOT_VALIDATED")
    assert.isUndefined(APP.ERROR_NOT_VALIDATED)

    assert.property(APP, "ERROR_VALID")
    assert.isNull(APP.ERROR_VALID)

    assert.isFunction(APP.validate, "validate")
    assert.isFunction(APP.validate.all, "validate.all")
    assert.isFunction(APP.isValid, "isValid")
    assert.isFunction(APP.validation, "validation")

    assert.isFunction(APP.validate.async, "validate.async")
    assert.isFunction(APP.validate.async.all, "validate.async.all")
    assert.isFunction(APP.isValid.async, "isValid.async")
    assert.isFunction(APP.validation.async, "validation.async")

    assert.isFunction(APP.scheme, "scheme")
    assert.isFunction(APP.scheme.async, "scheme.async")
  })


  it("validator arguments", () => {
    const validator = sinon.spy()

    const validate = APP.validate([
      [
        validator,
        "error message",
        "some validator parameter",
        "unused validator parameter",
      ]
    ])

    validate(-2, "validator_extra_arg_1", "validator_extra_arg_2")

    assert.deepEqual(
      validator.getCall(0).args,
      [
        -2,
        "some validator parameter",
        "validator_extra_arg_1",
        "validator_extra_arg_2",
      ]
    )
  })


  it("message as a function", () => {
    const msg = sinon.spy()

    const validate = APP.validate([
      [
        x => x > 0,
        msg,
        "some validator parameter",
        "unused validator parameter",
      ]
    ])

    validate(-2, "validator_extra_arg_1", "validator_extra_arg_2")

    assert.deepEqual(
      msg.getCall(0).args,
      [
        -2,
        "some validator parameter",
        "validator_extra_arg_1",
        "validator_extra_arg_2",
      ]
    )
  })
})