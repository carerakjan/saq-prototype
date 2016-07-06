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
            this.log[indexOfSuite].cases.push({
                title: caseTitle,
                assert: assert
            });
            callback(assert);
        }.bind(this);
    };

    var SAQ = window.SAQ = function() {
        this.log = [];
    };

    SAQ.prototype.suite = function(suiteTitle, callback) {
        var suit = {
            title: suiteTitle,
            cases: []
        };
        this.log.push(suit);
        callback(test.bind(this)(this.log.length-1));
        return this;
    };

    SAQ.prototype.report = function() {

        var result = {};
        var def = Q.defer();
        var log = this.log;

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

    };

})();