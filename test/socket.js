const io = require('socket.io-client');
const server = require('../server/server').server;
const assert = require('assert').strict;
const Board = require('../server/Board');
const mongoose = require('mongoose');
let socket;
describe('socket', () => {
  before(done => {
    const httpAddr = server.listen().address();
    socket = io.connect(`http://[${httpAddr.address}]:${httpAddr.port}`);
    socket.on('connect', done)
  })
  after(() => {
    mongoose.connection.close();
    server.close();
  })

  it('getBoard', (done) => {
    socket.emit('getboard')
    socket.once('broadcast', data => {
      assert.ok(data.elements);
      done();
    })
  })
})
