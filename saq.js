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

    var test = function(indexOfSuite) {

        return function(caseTitle, callback, options) {

            options = options || {};

            log[indexOfSuite].cases.push({
                suite: indexOfSuite,
                title: caseTitle,
                handler: function() {

                    var args = [].slice.call(arguments);

                    if(options.async) {
                        var deferred = defer();
                        callback.apply(null, [deferred].concat(args));
                        return deferred.promise;
                    }
                    return callback.apply(null, args);
                }
            });

        };

    };

    var suite = function(suiteTitle, callback) {

        var suit = {
            title: suiteTitle,
            cases: []
        };

        log.push(suit);

        callback(test(log.length-1));
    };

    var generateReport = function(tests) {

        var report = {};
        var isBreak = false;

        tests.forEach(function(test) {

            if(isBreak) return;

            !report[log[test.suite].title] &&
            (report[log[test.suite].title] = {
                index: test.suite,
                tests: []
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

            report[log[test.suite].title].tests.push(t);
        });

        return report;
    };

    var run = function() {

        var tests = log.reduce(function(test, suite) {
            return test.concat(suite.cases);
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

                if(!e || (e instanceof Error && !e.message)) {
                    e = new Error('Unnamed error');
                }

                if(e && !e.dirty) {
                    e.dirty = true;
                    test.error = e.message;
                }

                test.execution.push(Date.now());
                throw e;
            });

        }, promise(1)).then(function() {
            return generateReport(tests);
        }, function(e) {
            console.error(e);
            return generateReport(tests);
        });

    };

    return {
        suite: suite,
        run: run
    };
});