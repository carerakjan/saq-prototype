(function (definition) {

    if (typeof exports === "object") {
        module.exports = definition();

    } else if (typeof define === "function" && define.amd) {
        define(definition);

    } else {
        SQA = definition();
    }

})(function (){

    var log = [];

    var config = {
        stepTimeout: 30
    };

    var defer = function() {
        return Q.defer();
    };

    var promise = function(value) {
        return Q(value);
    };

    var term = function(measure) {
        var term = this.execution[1] - this.execution[0];
        switch (measure) {
            case 'min': term /= 60000; break;
            case 'sec': term /= 1000; break;
            default: measure = 'ms'; break;
        }
        return term + ' ' + measure;
    };

    var done = function(deferred) {
        return function(error) {
            if(!error) deferred.resolve();
            else deferred.reject(error);
        }
    };

    var startTimer = function(deferred) {
        setTimeout(function(){
            deferred.reject('Async callback was not invoked within timeout');
        }, config.stepTimeout * 1000);
    };

    var defineStep = function(indexOfSuite) {

        return function(caseTitle, callback) {

            log[indexOfSuite].cases.push({
                suite: indexOfSuite,
                title: caseTitle,
                handler: function() {
                    var deferred = defer();
                    startTimer(deferred);
                    callback(done(deferred));
                    return deferred.promise;
                }
            });

        };

    };

    var afterAll = function(indexOfSuite) {

        return function(callback) {

            log[indexOfSuite].afterAll.push({
                skipInReport: true,
                handler: function () {
                    var deferred = defer();
                    startTimer(deferred);
                    callback(done(deferred));
                    return deferred.promise;
                }
            });

        };

    };

    var suite = function(suiteTitle, callback) {

        var suit = {
            title: suiteTitle,
            afterAll: [],
            cases: []
        };

        log.push(suit);

        callback({
            step: defineStep(log.length-1),
            afterAll: afterAll(log.length-1)
        });
    };

    var generateReport = function(tests) {

        tests = tests.filter(function(test) {
            return !test.skipInReport;
        });

        var report = {};
        var isBreak = false;

        tests.forEach(function(test) {

            if(isBreak) return;

            !report[log[test.suite].title] &&
            (report[log[test.suite].title] = {
                index: test.suite,
                steps: []
            });

            var t = {title: test.title, result: []};
            t.result.push(term.bind(test)('sec'));
            if(test.error) {
                t.result.push('err');
                t.result.push(test.error);
                isBreak = true;
            } else {
                t.result.push('ok');
            }

            report[log[test.suite].title].steps.push(t);
        });

        return report;
    };

    var run = function() {

        var tests = log.reduce(function(test, suite) {
            return test.concat(suite.cases, suite.afterAll);
        },[]);

        return tests.reduce(function(def, test) {
            !test.skipInReport && !test.execution && (test.execution = []);

            return def.then(function(){
                !test.skipInReport && test.execution.push(Date.now());
                return test.handler.apply(null, arguments);
            }).then(function(data){
                !test.skipInReport && test.execution.push(Date.now());
                return data;
            }, function(e) {

                if(typeof e === 'string') {
                    e = new Error(e);
                }

                if(!e || !(e instanceof Error) || !e.message) {
                    e = new Error('Unnamed error');
                }

                if(e && !e.dirty) {
                    e.dirty = true;
                    test.error = e.message;
                }

                !test.skipInReport && test.execution.push(Date.now());
                throw e;
            });

        }, promise(1)).then(function() {
            return generateReport(tests);
        }, function(e) {
            console.error(e);
            return generateReport(tests);
        });

    };

    var setup = function(options) {
        extend(config, options);
    };

    var isObject = function(arg) {
        return typeof arg === 'object' && arg !== null;
    }

    var extend = function(origin, add) {
        // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin;

        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
            origin[keys[i]] = add[keys[i]];
        }
        return origin;
    }

    return {
        setup: setup,
        suite: suite,
        run: run
    };
});