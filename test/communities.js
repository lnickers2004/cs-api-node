var request = require('request'),
    assert  = require('chai').assert,
    setup   = require('./setup.js');

describe('GET /communities', function () {
    before(function (done) {
        setup.init(done);
    });

    it('should return at least one community', function (done) {
        request.get(setup.testUrl + '/communities', function (err, response, body) {
            body = JSON.parse(body);
            assert.ok(body.response.length > 0);
            done();
        });
    });
});

describe('GET /communities/:id', function () {
    before(function (done) {
        setup.init(done);
    });

    it('should return 1 result', function (done) {
        request.get(setup.testUrl + '/communities/public', function (err, response, body) {
            body = JSON.parse(body);
            assert.ok(body.response);
            done();
        });
    });
});

describe('POST /communities/add_member', function () {
    before(function (done) {
        setup.init(done);
    });

    it('should add member', function (done) {
        var reqBody = {
          membername: "apextestmember",
          community_id: "public"
        };
        request.post({ url: setup.testUrl + '/communities/add_member', form: reqBody },  function (err, response, body) {
            body = JSON.parse(body);
            console.log(body);
            assert.ok(body.response.success);
            done();
        });
    });
});
