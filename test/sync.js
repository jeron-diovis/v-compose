import * as APP from "../src"

describe("sync", () => {
  let validators

  beforeEach(() => {
    validators = [
      [
        x => x > 0,
        "not positive"
      ],

      [
        x => x !== -2,
        "is -2"
      ]
    ]
  })

  afterEach(() => {
    validators = null
  })

  it("get first error", () => {
    const validate = APP.validate(validators)

    assert.equal(
      validate(-2),
      "not positive"
    )

    assert.equal(
      validate(1),
      APP.ERR_VALID
    )
  })

  it("get all errors", () => {
    const validate = APP.validate.all(validators)

    assert.deepEqual(
      validate(-2),
      [
        "not positive",
        "is -2"
      ]
    )

    assert.deepEqual(
      validate(1),
      []
    )
  })

  it("isValid", () => {
    const isValid = APP.isValid(validators)

    assert.isFalse(isValid(-2))
    assert.isTrue(isValid(1))
  })

  it("validation object", () => {
    const obj = APP.validation(validators)

    assert.isObject(obj)
    assert.isFunction(obj.validate)
    assert.isFunction(obj.validate.all)
    assert.isFunction(obj.isValid)
  })
})
