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
        return function(caseTitle, callback, options) {
            //var assert = new Assert();
            //this.testCases.push({'func' : callback, 'assert' : assert});
            //this.log[indexOfSuite].cases.push({
            //    title: caseTitle,
            //    assert: assert
            //});
            //callback(assert);

            var fn = function() {

                if(options.async) {
                    var deferred = Q.defer();
                    callback(deferred);
                    return deferred.promise;
                }
                return callback();
            };

            this.log[indexOfSuite].cases.push({title:caseTitle, handler: fn});

        }.bind(this);
    };

    var SAQ = window.SAQ = function() {
        //this.log = [];
    };

    SAQ.prototype.log = [];

    SAQ.prototype.suite = function(suiteTitle, callback) {
        var suit = {
            title: suiteTitle,
            cases: []
        };
        this.log.push(suit);
        callback(test.bind(this)(this.log.length-1));
        return this;
    };

    SAQ.prototype.run = function() {

        this.log.reduce(function(test, suite) {
            return test.concat(suite.cases);
        },[]).reduce(function(def, test) {
            return def.then(test.handler);
        }, Q(1))

    };

})();