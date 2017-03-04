import * as APP from "../src"

describe("async", () => {
  let validators

  beforeEach(() => {
    validators = [
      [
        asyncify(x => x > 0),
        "not positive"
      ],

      [
        asyncify(x => x !== -2),
        "is -2"
      ],

      [
        asyncify(x => x !== 2),
        "is 2"
      ]
    ]
  })

  afterEach(() => {
    validators = null
  })

  // ---

  describe("get first error", () => {
    it("run", async () => {
      const validate = APP.validate.async(validators)

      assert.equal(await validate(2), "is 2")
      assert.equal(await validate(1), APP.ERR_VALID)
    })

    it("map", async () => {
      const validate = APP.validate.async(validators)
        .map(xs => [
          [
            x => x !== -3,
            "is -3"
          ],
          ...xs
        ])

      assert.equal(
        await validate(-3),
        "is -3"
      )

      assert.equal(
        await validate.map(xs => xs.slice(1))(-3),
        "not positive"
      )
    })

    it("if no validators returned explicit status, result must be ERR_NONE", async () => {
      const validate = APP.validate.async([])

      assert.strictEqual(
        await validate(undefined),
        APP.ERR_NONE
      )
    })
  })

  describe("get all errors", () => {
    it("run", async () => {
      const validate = APP.validateAll.async(validators)

      assert.deepEqual(
        await validate(-2),
        [
          "not positive",
          "is -2"
        ]
      )

      assert.deepEqual(await validate(1), [])
    })

    it("map", async () => {
      const validate = APP.validateAll.async(validators)
        .map(xs => [
          ...xs,
          [
            x => x !== -3,
            "is -3"
          ]
        ])

      assert.deepEqual(
        await validate(-3),
        [ "not positive", "is -3" ]
      )

      assert.deepEqual(
        await validate.map(xs => xs.slice(0, -1))(-3),
        [ "not positive" ]
      )
    })
  })

  describe("isValid", () => {
    it("run", async () => {
      const isValid = APP.isValid.async(validators)

      assert.isFalse(await isValid(-2))
      assert.isTrue(await isValid(1))
    })

    it("map", async () => {
      const isValid = APP.isValid.async(validators)
        .map(xs => [
          ...xs,
          [
            x => x !== 3,
            "is 3"
          ]
        ])

      assert.isFalse(await isValid(3))
      assert.isTrue(await isValid.map(xs => xs.slice(0, -1))(3))
    })
  })
})
