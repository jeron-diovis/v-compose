import * as APP from "../src"

describe("scheme", () => {

  let DATA, validateSync, validateAsync, validatorX, validatorY;

  beforeEach(() => {
    DATA = {
      x: -1,
      y: 1,
    }

    validatorX = sinon.spy(x => x > 0)
    validatorY = sinon.spy(x => x < 0)

    validateSync = APP.scheme({
      x: APP.validate([
        [
          validatorX,
          "x-error"
        ]
      ]),

      y: APP.validate([
        [
          validatorY,
          "y-error"
        ]
      ]),
    })


    validateAsync = APP.scheme.async({
      x: APP.validate.async([
        [
          asyncify(validatorX),
          "x-error"
        ]
      ]),

      y: APP.validate.async([
        [
          asyncify(validatorY),
          "y-error"
        ]
      ]),
    })
  })

  afterEach(() => {
    DATA = null
    validateSync = null
    validateAsync = null
    validatorX = null
    validatorY = null
  })

  // ---

  it("sync", () => {
    assert.deepEqual(
      validateSync(DATA, "extra arg"),
      {
        x: "x-error",
        y: "y-error",
      }
    )

    assert.deepEqual(
      validatorX.getCall(0).args,
      [
        DATA.x, // field value
        undefined, // validator params
        DATA, // entire state being validated
        "extra arg", // extra args passed to validator
      ]
    )
  })


  it("async", async () => {
    assert.deepEqual(
      await validateAsync(DATA, "extra arg"),
      {
        x: "x-error",
        y: "y-error",
      }
    )

    assert.deepEqual(
      validatorX.getCall(0).args,
      [
        DATA.x, // field value
        undefined, // validator params
        DATA, // entire state being validated
        "extra arg", // extra args passed to validator
      ]
    )
  })


  describe("subset", () => {

    describe("sync", () => {
      it("fields", () => {
        assert.isFunction(validateSync.fields)

        const validateX = validateSync.fields(["x"])
        const result = validateX(DATA, "extra arg")

        assert.deepEqual(result, {
          x: "x-error",
        })

        assert.deepEqual(
          validatorX.getCall(0).args,
          [
            DATA.x, // field value
            undefined, // validator params
            DATA, // entire state being validated
            "extra arg", // extra args passed to validator
          ]
        )
      })

      it("single field", () => {
        assert.isFunction(validateSync.field)

        const validateX = validateSync.field("x")
        const result = validateX(-1, "extra arg")

        assert.deepEqual(result, "x-error")

        assert.deepEqual(
          validatorX.getCall(0).args,
          [
            -1, // validated value
            undefined,  // validator params
            "extra arg", // extra args passed to validator
          ]
        )
      })
    })

    describe("async", () => {
      it("fields", async () => {
        assert.isFunction(validateAsync.fields)

        const validateX = validateAsync.fields(["x"])
        const result = await validateX(DATA, "extra arg")

        assert.deepEqual(result, {
          x: "x-error",
        })

        assert.deepEqual(
          validatorX.getCall(0).args,
          [
            DATA.x, // field value
            undefined, // validator params
            DATA, // entire state being validated
            "extra arg", // extra args passed to validator
          ]
        )
      })

      it("single field", async () => {
        assert.isFunction(validateAsync.field)

        const validateX = validateAsync.field("x")
        const result = await validateX(-1, "extra arg")

        assert.deepEqual(result, "x-error")

        assert.deepEqual(
          validatorX.getCall(0).args,
          [
            -1, // validated value
            undefined,  // validator params
            "extra arg", // extra args passed to validator
          ]
        )
      })
    })

    it("should require only keys defined in scheme", () => {
      assert.throws(
        () => validateSync.field("unexisting"),
        Error,
        /not defined is scheme/,
        "single field"
      )

      assert.throws(
        () => validateSync.fields([ "unexisting" ]),
        Error,
        /not defined in scheme/,
        "multiple fields"
      )
    })
  })
})
