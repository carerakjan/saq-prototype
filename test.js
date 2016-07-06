var t1 = new SAQ().suite('Check the set of async calls', function(test) {

    test('Check if user is logged', function(assert) {
        if($('.fn-logout').length) {
            assert.ok();
            $('.fn-logout')[0].click();
        } else {
            assert.fail();
        }
    });

    test('Check logout confirmation popup is appeared after 500 ms', function(assert) {

        setTimeout(function() {

            assert.ok();

        }, 500);

        setTimeout(function() {

            assert.fail();
            console.log(222);

        }, 1500);


    });

    test('Get some json', function (assert) {

        $.get('https://code.jquery.com/jquery-3.0.0.min.js', function(data){
            if(data) {
                assert.ok(data);
            }
            else {
                assert.fail();
            }
        });

    });

});

