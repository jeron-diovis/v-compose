import * as APP from "../src"

describe("scheme", () => {

  let data, validateSync, validateAsync;

  beforeEach(() => {
    data = {
      x: -1,
      y: 1,
    }

    validateSync = APP.scheme({
      x: APP.validate([
        [
          x => x > 0,
          "x-error"
        ]
      ]),

      y: APP.validate([
        [
          x => x < 0,
          "y-error"
        ]
      ]),
    })


    validateAsync = APP.scheme.async({
      x: APP.validate.async([
        [
          asyncify(x => x > 0),
          "x-error"
        ]
      ]),

      y: APP.validate.async([
        [
          asyncify(x => x < 0),
          "y-error"
        ]
      ]),
    })
  })

  afterEach(() => {
    data = null
    validateSync = null
    validateAsync = null
  })

  // ---

  it("sync", () => {
    assert.deepEqual(
      validateSync(data),
      {
        x: "x-error",
        y: "y-error",
      }
    )
  })


  it("async", async () => {
    assert.deepEqual(
      await validateAsync(data),
      {
        x: "x-error",
        y: "y-error",
      }
    )
  })


  describe("subset", () => {

    describe("sync", () => {
      it("fields", () => {
        assert.isFunction(validateSync.fields)

        const validateX = validateSync.fields(["x"])
        const result = validateX(data)

        assert.deepEqual(result, {
          x: "x-error",
        })
      })

      it("single field", () => {
        assert.isFunction(validateSync.field)

        const validateX = validateSync.field("x")
        const result = validateX(-1)

        assert.deepEqual(result, "x-error")
      })
    })

    describe("async", () => {
      it("fields", async () => {
        assert.isFunction(validateAsync.fields)

        const validateX = validateAsync.fields(["x"])
        const result = await validateX(data)

        assert.deepEqual(result, {
          x: "x-error",
        })
      })

      it("single field", async () => {
        assert.isFunction(validateAsync.field)

        const validateX = validateAsync.field("x")
        const result = await validateX(-1)

        assert.deepEqual(result, "x-error")
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
