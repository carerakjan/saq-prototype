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
                    if(options.async) {
                        var deferred = defer();
                        callback(deferred);
                        return deferred.promise;
                    }
                    return callback();
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
            (report[log[test.suite].title] = {});

            var t = report[log[test.suite].title][test.title] = [];
            t.push(term.bind(test)('sec'));
            if(test.error) {
                t.push('err');
                t.push(test.error);
                isBreak = true;
            } else {
                t.push('ok');
            }

        });

        console.log(report);
    };

    var run = function() {

        var tests = log.reduce(function(test, suite) {
            return test.concat(suite.cases);
        },[]);

        tests.reduce(function(def, test) {
            !test.execution && (test.execution = []);
            test.execution.push(Date.now());

            return def.then(test.handler).then(function(){
                test.execution.push(Date.now());
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

        }, Q(1)).then(function() {
            generateReport(tests);
        }, function(e) {
            generateReport(tests);
            //console.error(e);
        });

    };

    return {
        suite: suite,
        run: run
    };
});