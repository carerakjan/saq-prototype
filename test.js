var t1 = new SAQ();

t1.suite('suite1', function(test) {
    test('test1', function() {
        if(1) {
            console.log('suite1test1');
        } else throw Error();
    });

    test('test2', function() {
        if(1) {
            console.log('suite1test2');
        } else throw Error();
    });


    //test('test2', function(defered) {
    //    $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
    //        if(data) {
    //            console.log('suite1test2');
    //            defered.resolve();
    //        }
    //        else {
    //            defered.reject();
    //        }
    //    });
    //}, {
    //    async:true
    //});
    //
    //t1.suite('suite3', function(test){
    //
    //    test('test4', function(defered) {
    //        $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
    //            if(data) {
    //                console.log('suite3test4');
    //                defered.resolve();
    //            }
    //            else {
    //                defered.reject();
    //            }
    //        });
    //    }, {
    //        async:true
    //    });
    //})
});

//t1.suite('suite2', function(test) {
//    test('test3', function(defered) {
//        $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
//            if(data) {
//                console.log('suite2test3');
//                defered.resolve();
//            }
//            else {
//                defered.reject();
//            }
//        });
//    }, {
//        async:true
//    });
//
//});

