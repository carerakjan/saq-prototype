var suite = SQA.suite;
var run = SQA.run;

suite('xqsuite1', function(test) {

    test('test1', function() {
        if(1) {

        } else throw Error();
    });

    test('test5', function(defered) {

        dslfkdsfsd.asdas();


        setTimeout(function(){
            try {
            if(!1){
                defered1.resolve();
            } else {
                throw Error('reject');
            }


            } catch(e) {
                defered.reject(e);
            }
        }, 5)
    }, {
        async:true
    });

    test('test2', function(defered) {
        $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
            try {

                if(data) {
                    defered.resolve();
                }

            } catch (e) {
                defered.reject(e);
            }
        });
    }, {
        async:true
    });

    suite('suite3', function(test){

        test('test4', function(defered) {
            $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
                try {
                    if(data1) {
                        defered.resolve();
                    }
                } catch(e) {
                    defered.reject(e);
                }
            });
        }, {
            async:true
        });
    })
});

suite('suite2', function(test) {
    test('test3', function(defered) {
        $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
            try {
                if(data) {
                    defered.resolve();
                }
            } catch(e) {
                defered.reject(e);
            }

        });
    }, {
        async:true
    });

});

run();