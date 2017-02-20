import * as APP from "../src"

describe("validation object", () => {

  let Validation

  beforeEach(() => {
    Validation = APP.validation([
      [
        x => x > 0,
        "not positive"
      ],

      [
        x => x !== -2,
        "is -2"
      ],

      [
        x => x !== 2,
        "is 2"
      ]
    ])
  })

  afterEach(() => {
    Validation = null
  })

  it("api", () => {
    assert.isObject(Validation)


    assert.isFunction(Validation.first)
    assert.isFunction(Validation.all)
    assert.isFunction(Validation.isValid)

    assert.isFunction(Validation.first.map)
    assert.isFunction(Validation.all.map)
    assert.isFunction(Validation.isValid.map)

    assert.isFunction(Validation.map)
  })

  describe("get first error", () => {
    it("run", () => {
      const validate = Validation.first

      assert.equal(
        validate(2),
        "is 2"
      )

      assert.equal(
        validate(1),
        APP.ERR_VALID
      )
    })

    it("map", () => {
      const validate = Validation.first.map(xs => [
        [
          x => x !== -3,
          "is -3"
        ],
        ...xs
      ])

      assert.equal(
        validate(-3),
        "is -3"
      )

      assert.equal(
        validate.map(xs => xs.slice(1))(-3),
        "not positive"
      )
    })
  })

  describe("get all errors", () => {
    it("run", () => {
      const validate = Validation.all

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

    it("map", () => {
      const validate = Validation.all.map(xs => [
        ...xs,
        [
          x => x !== -3,
          "is -3"
        ]
      ])

      assert.deepEqual(
        validate(-3),
        [ "not positive", "is -3" ]
      )

      assert.deepEqual(
        validate.map(xs => xs.slice(0, -1))(-3),
        [ "not positive" ]
      )
    })
  })

  describe("isValid", () => {
    it("run", () => {
      const isValid = Validation.isValid

      assert.isFalse(isValid(-2))
      assert.isTrue(isValid(1))
    })

    it("map", () => {
      const isValid = Validation.isValid.map(xs => [
        ...xs,
        [
          x => x !== 3,
          "is 3"
        ]
      ])

      assert.isFalse(isValid(3))
      assert.isTrue(isValid.map(xs => xs.slice(0, -1))(3))
    })
  })

  it("map", () => {
    const validation = Validation
      .map(xs => [ xs[0] ])
      .map(xs => [
        ...xs,
        [
          x => x !== -1,
          "is -1"
        ]
      ])

    assert.equal(validation.first(-1), "not positive")
    assert.deepEqual(validation.all(-1), [
      "not positive",
      "is -1"
    ])
    assert.isFalse(validation.isValid(-1))
  })
})
