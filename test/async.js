import * as APP from "../src"

describe("async", () => {
  let validators, tickAllTheWay

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

    tickAllTheWay = tick => {
      // promises in `getFirstError` validator are created one by one, only when previous one is resolved,
      // so need to tick each of them manually
      validators.forEach(() => tick())
    }
  })

  afterEach(() => {
    validators = null
    tickAllTheWay = null
  })

  // ---

  it("get first error", () => {
    const validate = APP.validate.async(validators)

    let result, spy

    FakeAsync(tick => {
      spy = sinon.spy()
      result = validate(2)
      result.then(spy)
      tickAllTheWay(tick)
      assert.equal(spy.getCall(0).args[0], "is 2")

      spy = sinon.spy()
      result = validate(1)
      result.then(spy)
      tickAllTheWay(tick)
      assert.equal(spy.getCall(0).args[0], APP.ERR_VALID)
    })
  })

  it("get all errors", () => {
    const validate = APP.validate.async.all(validators)

    let result, spy

    FakeAsync(tick => {
      spy = sinon.spy()
      result = validate(-2)
      result.then(spy)
      tick()
      assert.deepEqual(spy.getCall(0).args[0], [
        "not positive",
        "is -2"
      ])

      spy = sinon.spy()
      result = validate(1)
      result.then(spy)
      tick()
      assert.deepEqual(spy.getCall(0).args[0], [])
    })
  })

  it("isValid", () => {
    const isValid = APP.isValid.async(validators)

    let result, spy

    FakeAsync(tick => {
      spy = sinon.spy()
      result = isValid(-2)
      result.then(spy)
      tick()
      assert.isFalse(spy.getCall(0).args[0])

      spy = sinon.spy()
      result = isValid(1)
      result.then(spy)
      tickAllTheWay(tick)
      assert.isTrue(spy.getCall(0).args[0])
    })
  })

  it("validation object", () => {
    const obj = APP.validation.async(validators)

    assert.isObject(obj)
    assert.isFunction(obj.validate)
    assert.isFunction(obj.validate.all)
    assert.isFunction(obj.isValid)
  })
})
