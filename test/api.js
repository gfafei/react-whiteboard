const request = require('supertest');
const app = require('../server/server').server;
const assert = require('assert').strict;
const Board = require('../server/Board');

describe('Board', function() {
  before(async function() {
    const board = new Board({ _id: 'board1' });
    await board.save();
  })
  after(async function() {
    app.close();
  })
  it('delete board', function(done) {
    request(app)
      .post('/boards/delete')
      .send({ boards: ['board1'] })
      .expect(200)
      .end(function(err, res) {
        assert.equal(res.body.deletedCount, 1)
        done(err);
      })
  })

})
