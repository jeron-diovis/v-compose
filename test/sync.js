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
      ],

      [
        x => x !== 2,
        "is 2"
      ]
    ]
  })

  afterEach(() => {
    validators = null
  })

  describe("get first error", () => {
    it("run", () => {
      const validate = APP.validate(validators)

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
      const validate = APP.validate(validators)
        .map(xs => [
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
      const validate = APP.validateAll(validators)

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
      const validate = APP.validateAll(validators)
        .map(xs => [
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
      const isValid = APP.isValid(validators)

      assert.isFalse(isValid(-2))
      assert.isTrue(isValid(1))
    })

    it("map", () => {
      const isValid = APP.isValid(validators)
        .map(xs => [
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
})
