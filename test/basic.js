import validation, * as APP from "../src"

describe("basics", () => {
  it("api", () => {
    assert.isFunction(APP.isError, "isError")
    assert.isFunction(APP.isError.not, "isError.not")

    assert.isFunction(APP.hasErrors, "hasErrors")
    assert.isFunction(APP.hasErrors.not, "hasErrors.not")

    assert.property(APP, "ERR_NONE")
    assert.isUndefined(APP.ERR_NONE)

    assert.property(APP, "ERR_VALID")
    assert.isNull(APP.ERR_VALID)

    assert.isFunction(APP.validate, "validate")
    assert.isFunction(APP.validateAll, "validateAll")
    assert.isFunction(APP.isValid, "isValid")
    assert.isFunction(APP.validation, "validation")

    assert.isFunction(validation, "default export")
    assert.equal(validation, APP.validation, "default export eq .validation")

    assert.isFunction(APP.validate.async, "validate.async")
    assert.isFunction(APP.validateAll.async, "validateAll.async")
    assert.isFunction(APP.isValid.async, "isValid.async")
    assert.isFunction(APP.validation.async, "validation.async")

    assert.isFunction(APP.scheme, "scheme")
    assert.isFunction(APP.scheme.async, "scheme.async")
  })

  it("isError", () => {
    assert.isFalse(APP.isError(APP.ERR_VALID), "ERR_VALID")
    assert.isFalse(APP.isError(APP.ERR_NONE), "ERR_NONE")
    assert.isTrue(APP.isError("whatever"), "anything else")
    assert.isFalse(APP.isError.not("whatever"), "invert anything else")
  })

  it("hasErrors", () => {
    assert.isFalse(APP.hasErrors({
      x: APP.ERR_VALID,
      y: APP.ERR_NONE,
    }), "valid scheme")

    assert.isTrue(APP.hasErrors({
      x: APP.ERR_VALID,
      y: "whatever",
    }), "invalid scheme")

    assert.isTrue(APP.hasErrors({
      x: [ APP.ERR_NONE, "whatever" ],
    }), "scheme with array")

    assert.isFalse(APP.hasErrors.not({
      x: [ APP.ERR_NONE, "whatever" ],
    }), "invert scheme with array")
  })

  describe("validator arguments", () => {

    let validator, cfg

    beforeEach(() => {
      validator = sinon.spy()

      cfg = [
        [
          validator,
          "error message",
          "some validator parameter",
          "unused validator parameter",
        ]
      ]
    })

    afterEach(() => {
      validator = null
      cfg = null
    })

    const test = create => {
      const validate = create(cfg)

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
    }

    it("single", () => {
      test(APP.validate)
    })

    it("all", () => {
      test(APP.validateAll)
    })
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


  it("should require validator to return only true, false or ERR_NONE", () => {
    const validate = APP.validate([
      [
        x => {
          if (x < 0) {
            return {}
          }

          return APP.ERR_NONE
        }
      ]
    ])

    assert.equal(
      validate(1),
      APP.ERR_NONE
    )

    assert.throws(
      () => validate(-2),
      /Validator must return only true, false/
    )
  })

  it("should warn when sync validator returns a Promise", () => {
    const warn = sinon.stub(console, "warn")

    const validate = APP.validate([
      [ x => Promise.resolve(APP.ERR_VALID) ]
    ])

    try { validate(1) } catch (e) {}
    assert.match(
      warn.getCall(0).args[0],
      /Your validator seems to return a Promise/
    )

    warn.restore()
  })
})