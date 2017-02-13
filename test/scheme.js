import * as APP from "../src"

describe("scheme", () => {

  it("sync", () => {
    const validate = APP.scheme({
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

    const data = {
      x: -1,
      y: 1,
    }

    const result = validate(data)

    assert.deepEqual(result, {
      x: "x-error",
      y: "y-error",
    })
  })


  it("async", async () => {
    const validate = APP.scheme.async({
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

    const data = {
      x: -1,
      y: 1,
    }

    const result = await validate(data)

    assert.deepEqual(result, {
      x: "x-error",
      y: "y-error",
    })
  })


  it("subset", () => {
    const validate = APP.scheme({
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

    assert.isFunction(validate.only)

    const validateX = validate.only([ "x" ])

    const data = {
      x: -1,
      y: 1,
    }

    const result = validateX(data)

    assert.deepEqual(result, {
      x: "x-error",
    })
  })
})