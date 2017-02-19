import * as APP from "../src"

describe("basics", () => {
  it("api", () => {
    assert.isFunction(APP.isError, "isError")
    assert.isFunction(APP.isError.not, "isError.not")

    assert.property(APP, "ERR_NONE")
    assert.isUndefined(APP.ERR_NONE)

    assert.property(APP, "ERR_VALID")
    assert.isNull(APP.ERR_VALID)

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
      test(APP.validate.all)
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