const { expect } = require('chai');
const { assert } = require('chai');

describe('Array', function() {

    describe('#indexOf()', function() {

        it('should return -1 when the value is not present', function() {
            expect([1, 2, 3].indexOf(4)).eq(-1)
            // assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});
