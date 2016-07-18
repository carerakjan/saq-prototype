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

    var startTimer = function(deferred, stepTimeout) {
        stepTimeout = stepTimeout || config.stepTimeout;
        setTimeout(function(){
            deferred.reject('Async callback was not invoked within timeout');
        }, stepTimeout * 1000);
    };

    var defineHandler = function(callback, options) {
        options = options || {};
        return function() {
            var deferred = defer();
            startTimer(deferred, options.stepTimeout ? options.stepTimeout : null);
            callback(done(deferred));
            return deferred.promise;
        };
    };

    var defineStep = function(indexOfSuite) {

        return function(caseTitle, callback, options) {

            log[indexOfSuite].cases.push({
                suite: indexOfSuite,
                title: caseTitle,
                handler: defineHandler(callback, options)
            });

        };

    };

    var defineAfterAll = function(indexOfSuite) {

        return function(callback, options) {

            log[indexOfSuite].afterAll.push({
                suite: indexOfSuite,
                title: 'Teardown step',
                skipInReport: true,
                handler: defineHandler(callback, options)
            });

        };

    };

    var defineBeforeAll = function(indexOfSuite) {

        return function(callback, options) {

            log[indexOfSuite].beforeAll.push({
                suite: indexOfSuite,
                title: 'Setup step',
                skipInReport: true,
                handler: defineHandler(callback, options)
            });

        };

    };

    var suite = function(suiteTitle, callback) {

        var suit = {
            title: suiteTitle,
            beforeAll: [],
            afterAll: [],
            cases: []
        };

        log.push(suit);

        callback({
            step: defineStep(log.length-1),
            afterAll: defineAfterAll(log.length-1),
            beforeAll: defineBeforeAll(log.length-1)
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
            return test.concat(suite.beforeAll, suite.cases, suite.afterAll);
        },[]);

        return tests.reduce(function(def, test) {
            !test.execution && (test.execution = []);

            return def.then(function(){
                test.execution.push(Date.now());
                return test.handler.apply(null, arguments);
            }).then(function(data){
                test.execution.push(Date.now());
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

                test.execution.push(Date.now());
                test.skipInReport && (test.skipInReport = !test.skipInReport);

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
    };

    var extend = function(origin, add) {
        // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin;

        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
            origin[keys[i]] = add[keys[i]];
        }
        return origin;
    };

    return {
        setup: setup,
        suite: suite,
        run: run
    };
});