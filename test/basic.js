import validation, * as APP from "../src"
import { ERR_NONE } from "../src/constants"

describe("basics:", () => {
  it("api", () => {
    assert.isFunction(APP.isError, "isError")
    assert.isFunction(APP.isError.not, "isError.not")

    assert.isFunction(APP.hasErrors, "hasErrors")
    assert.isFunction(APP.hasErrors.not, "hasErrors.not")

    assert.isFunction(APP.getErrorValue, "APP.getErrorValue")
    assert.isFunction(APP.getValidityStatus, "getValidityStatus")

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

  describe("APP.getErrorValue:", () => {
    it("raw", () => {
      assert.equal(APP.getErrorValue("some error msg"), "some error msg", "error text")
      assert.equal(APP.getErrorValue(APP.ERR_VALID), APP.ERR_VALID, "valid")
      assert.equal(APP.getErrorValue(APP.ERR_NONE), APP.ERR_NONE, "none")
    })

    describe("collections:", () => {
      describe("array:", () => {
        it("should return first found error value", () => {
          assert.equal(
            APP.getErrorValue([
              APP.ERR_NONE,
              APP.ERR_VALID,
              "some error msg",
              "some another error msg",
            ]),
            "some error msg",
          )
        })

        it("should return first found 'valid' value if there are no errors", () => {
          assert.equal(
            APP.getErrorValue([
              APP.ERR_NONE,
              APP.ERR_VALID,
            ]),
            APP.ERR_VALID,
          )
        })

        it("should return ERR_NONE, if there are no errors and no 'valid' values", () => {
          assert.equal(
            APP.getErrorValue([]),
            APP.ERR_NONE,
          )
        })
      })

      describe("object:", () => {
        it("should return first found error value", () => {
          assert.equal(
            APP.getErrorValue({
              a: APP.ERR_NONE,
              b: APP.ERR_VALID,
              c: "some error msg",
              d: "some another error msg",
            }),
            "some error msg",
          )
        })

        it("should return first found 'valid' value if there are no errors", () => {
          assert.equal(
            APP.getErrorValue({
              a: APP.ERR_NONE,
              b: APP.ERR_VALID,
            }),
            APP.ERR_VALID,
          )
        })

        it("should return ERR_NONE, if there are no errors and no 'valid' values", () => {
          assert.equal(
            APP.getErrorValue({}),
            APP.ERR_NONE,
          )
        })
      })
    })
  })

  describe("getValidityStatus:", () => {
    it("raw", () => {
      assert.equal(APP.getValidityStatus("some error msg"), false, "error text")
      assert.equal(APP.getValidityStatus(APP.ERR_VALID), true, "valid")
      assert.equal(APP.getValidityStatus(APP.ERR_NONE), undefined, "none")
    })

    describe("collections:", () => {
      describe("array:", () => {
        it("should return 'false' if there are errors", () => {
          assert.equal(
            APP.getValidityStatus([
              APP.ERR_NONE,
              APP.ERR_VALID,
              "some error msg",
              "some another error msg",
            ]),
            false,
          )
        })

        it("should return 'true' if there are 'valid' values and no errors", () => {
          assert.equal(
            APP.getValidityStatus([
              APP.ERR_NONE,
              APP.ERR_VALID,
            ]),
            true,
          )
        })

        it("should return 'undefined', if there are no errors and no 'valid' values", () => {
          assert.equal(
            APP.getValidityStatus([]),
            undefined,
          )
        })
      })

      describe("object:", () => {
        it("should return 'false' if there are errors", () => {
          assert.equal(
            APP.getValidityStatus({
              a: APP.ERR_NONE,
              b: APP.ERR_VALID,
              c: "some error msg",
              d: "some another error msg",
            }),
            false,
          )
        })

        it("should return 'true' if there are 'valid' values and no errors", () => {
          assert.equal(
            APP.getValidityStatus({
              a: APP.ERR_NONE,
              b: APP.ERR_VALID,
            }),
            true,
          )
        })

        it("should return 'undefined', if there are no errors and no 'valid' values", () => {
          assert.equal(
            APP.getValidityStatus({}),
            APP.ERR_NONE,
          )
        })
      })
    })
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


  describe("should require validator to return only true, false or ERR_NONE:", () => {
    let config

    beforeEach(() => {
      config = [
        [
          x => {
            if (x < 0) {
              return {}
            }

            return APP.ERR_NONE
          }
        ]
      ]
    })

    afterEach(() => {
      config = null
    })

    it("sync", () => {
      const validate = APP.validate(config)

      assert.equal(
        validate(1),
        APP.ERR_NONE,
        "valid value"
      )

      assert.throws(
        () => validate(-2),
        Error,
        /Validator must return only true, false/,
        "invalid value"
      )
    })

    it("async", async () => {
      const validate = APP.validate.async(config)

      assert.equal(
        await validate(1),
        APP.ERR_NONE,
        "valid value"
      )

      // not sure this is correct way to test async exceptions
      const onError = sinon.spy()
      await validate(-2).catch(onError)
      assert.match(
        onError.getCall(0).args[0].message,
        /Validator must return only true, false/
      )
    })
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

  it("if no validators returned explicit status, result must be ERR_NONE", () => {
    const validate = APP.validate([])

    assert.strictEqual(
      validate(undefined),
      APP.ERR_NONE
    )
  })

  it("if error msg is empty, should return default msg", () => {
    const validate = APP.validate([
      [ x => x > 0 ]
    ])

    assert.match(
      validate(undefined),
      /Undefined error message/
    )
  })

  describe("should allow to pass a function instead of validator config", () => {
    it("sync", () => {
      const validator = x => x > 0 ? null : "error"
      const validate = APP.validate([ validator ])

      assert.equal(
        validate(-1),
        "error"
      )
    })

    it("async", async () => {
      const validator = x => x > 0 ? null : "error"
      const validate = APP.validate.async([ validator ])

      assert.equal(
        await validate(-1),
        "error"
      )
    })
  })

  describe("named validators", () => {
    describe("should allow object instead of array as validators list", () => {
      it("sync", () => {
        const validator = x => x > 0 ? null : "error"
        const validate = APP.validate({ validator })

        assert.equal(
          validate(-1),
          "error"
        )
      })

      it("async", async () => {
        const validator = x => x > 0 ? null : "error"
        const validate = APP.validate.async({ validator })

        assert.equal(
          await validate(-1),
          "error"
        )
      })
    })

    describe("`validateAll` should return object with keys of failed validators", () => {
      it("sync", () => {
        const validate = APP.validateAll({
          number: [ x => typeof x === "number", "not number" ],
          positive: [ x => x > 0, "not positive" ],
          even: [ x => x % 2 === 0, "not even" ],
        })

        assert.deepEqual(
          validate(-1),
          {
            positive: "not positive",
            even: "not even",
          }
        )
      })

      it("async", async () => {
        const validate = APP.validateAll.async({
          number: [ x => typeof x === "number", "not number" ],
          positive: [ x => x > 0, "not positive" ],
          even: [ x => x % 2 === 0, "not even" ],
        })

        assert.deepEqual(
          await validate(-1),
          {
            positive: "not positive",
            even: "not even",
          }
        )
      })
    })
  })

  describe("should allow object { fn, msg, params } as particular validator config", () => {
    it("sync", () => {
      const validate = APP.validate([
        {
          fn: x => x > 0,
          msg: "error"
        }
      ])

      assert.equal(
        validate(-1),
        "error"
      )
    })

    it("async", async () => {
      const validate = APP.validate.async([
        {
          fn: x => x > 0,
          msg: "error"
        }
      ])

      assert.equal(
        await validate(-1),
        "error"
      )
    })
  })

  it("composition", () => {
    const V1 = APP.validate([
      [ x => x > 0, "not positive" ]
    ])

    const V2 = APP.validateAll([
      V1,
      [ x => x !== -1, "is -1" ],
    ])

    assert.deepEqual(
      V2(-1),
      [
        "not positive",
        "is -1"
      ]
    )
  })

  describe("`.map` should always receive validator config in object form", () => {
    let fn, msg, params, spy

    beforeEach(() => {
      fn = x => x > 0
      msg = "error"
      params = {}
      spy = sinon.spy()
    })

    afterEach(() => {
      fn = null
      msg = null
      params = null
      spy = null
    })

    const test = (fn, label) => () => {
      fn([
        [ fn, msg, params ]
      ])
      .map(spy)

      const validatorsList = spy.getCall(0).args[0]
      const validatorConfig = validatorsList[0]

      assert.equal(validatorConfig.constructor, Object, `${label}: config is not an object`)
      assert.equal(validatorConfig.fn, fn, `${label}: fn is wrong`)
      assert.equal(validatorConfig.msg, msg, `${label}: msg is wrong`)
      assert.equal(validatorConfig.params, params, `${label}: params is wrong`)
    }

    it(".validate", test(APP.validate, ".validate"))
    it(".validateAll", test(APP.validateAll, ".validateAll"))
    it(".isValid", test(APP.isValid, ".isValid"))
    it(".validation", test(APP.validation, ".validation"))
  })
})
