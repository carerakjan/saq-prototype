(function (){

    function Assert() {
        this.deferred = Q.defer();
    }
    Assert.prototype.ok = function() {
        this.deferred.resolve.apply(this.deferred, arguments);
    };
    Assert.prototype.fail = function() {
        this.deferred.reject(this.deferred, arguments);
    };

    var log = [];

    var test = function(indexOfSuite) {
        return function(caseTitle, callback) {
            var assert = new Assert();
            log[indexOfSuite].cases.push({
                title: caseTitle,
                assert: assert
            });
            callback(assert);
        }
    };

    window.SAQ = {
        log: log,
        suite: function(suiteTitle, callback) {
            var suit = {
                title: suiteTitle,
                cases: []
            };
            log.push(suit);
            callback(test(log.length-1));
        },

        report: function() {

            var result = {};
            var def = Q.defer();

            log.forEach(function(suite, i) {
                !result[suite.title] && (result[suite.title] = {});
                suite.cases.forEach(function(test, j) {
                    test.assert.deferred.promise.then(function(){
                        result[suite.title][test.title] = 'ok';
                    }, function(){
                        result[suite.title][test.title] = 'err';
                    });

                    if(i === log.length-1 && j === suite.cases.length-1) {
                        def.resolve(result);
                    }
                });
            });

            return def.promise

        }
    }


})();