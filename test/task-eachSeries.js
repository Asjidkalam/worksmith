var workflow = require('../')
var assert = require('assert')
var _ = require('lodash')

describe("eachSeriesActivity", function () {

    it("should iterate over a list of items", function (done) {
        var context = { counter: {count: 0 }};

        var wi = workflow({
            task: "eachSeries",
            items: [1, 2, 3],
            subflow: {
                task: function(definition) {
                    return function(context) {
                        return function(done) {
                            context.counter.count++
                            done()
                        }
                    }
                }
            }
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            assert.equal(context.counter.count, 3)
            done()
        })
    })

    it("should not barf on large loops", function (done) {

        this.timeout(20000)
        var context = { counter: { count: 0 } }

        var wi = workflow({
            task: "eachSeries",
            items: _.range(0, 99999),
            subflow: {
                task: function(definition) {
                    return function(context) {
                        return function(done) {
                            context.counter.count++
                            done()
                        }
                    }
                }
            }
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            assert.equal(context.counter.count, 99999)
            done()
        })
    })

    it("should work in nested loops", function (done) {
        var context = { counter: {count: 0 } };

        var wi = workflow({
            task: "eachSeries",
            items: [1, 2, 3],
            subflow: {
                task: "eachSeries",
                items: [1, 2, 3],
                subflow: {
                    task: function(definition) {
                        return function(context) {
                            return function(done) {
                                context.counter.count++
                                done()
                            }
                        }
                    }
                }
            }
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            assert.equal(context.counter.count, 9)
            done()
        })
    })
})