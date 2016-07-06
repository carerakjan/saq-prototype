var t2 = new SAQ().suite('Arithmetic operations', function(test) {

    test('Check 1+1', function(assert) {
        if((1+1) === 2) {
            assert.ok();
        } else {
            assert.fail();
        }
    });

});

