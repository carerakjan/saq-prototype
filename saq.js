(function (){

    function Assert() {
        this.execution = [Date.now()];
        this.deferred = Q.defer();
    }

    Assert.prototype.ok = function() {
        if(this._fulfilled()) return;
        this.execution.push(Date.now());
        this.deferred.resolve.apply(this.deferred, arguments);
    };

    Assert.prototype.fail = function() {
        if(this._fulfilled()) return;
        this.execution.push(Date.now());
        this.deferred.reject(this.deferred, arguments);
    };

    Assert.prototype._fulfilled = function() {
        return /^fulfilled|rejected$/.test(this._inspect().state);
    };

    Assert.prototype._inspect = function() {
        return this.deferred.promise.inspect();
    };

    Assert.prototype._term = function(measure) {
        var term = this.execution[1] - this.execution[0];
        switch (measure) {
            case 'min': term /= 60000; break;
            case 'sec': term /= 1000; break;
            default: measure = 'ms'; break;
        }
        return term + ' ' + measure;
    };

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
                var term = [test.assert._term('sec')];
                test.assert.deferred.promise.then(function(){
                    result[suite.title][test.title] = ['ok'].concat(term);
                }, function(){
                    result[suite.title][test.title] = ['err'].concat(term);
                });

                if(i === log.length-1 && j === suite.cases.length-1) {
                    def.resolve(result);
                }
            });
        });

        return def.promise

    };

})();