const io = require('socket.io-client');
const server = require('../server/server').server;
const assert = require('assert').strict;
const Board = require('../server/Board');
const mongoose = require('mongoose');
const testData = require('./data.json');

let socket1;
let socket2;
describe('socket', () => {
  before(done => {
    const httpAddr = server.listen().address();
    socket1 = io.connect(`http://[${httpAddr.address}]:${httpAddr.port}`);
    socket2 = io.connect(`http://[${httpAddr.address}]:${httpAddr.port}`);
    const tryDone = () => {
      if (socket1.connected && socket2.connected) {
        done();
      }
    }
    socket1.on('connect', tryDone)
    socket2.on('connect', tryDone)
  })
  after(() => {
    mongoose.connection.close();
    server.close();
  })

  it('getBoard', (done) => {
    socket1.emit('getBoard', 'anonymous')
    socket1.once('broadcast', data => {
      assert.ok(data.elements);
      done();
    })
  })
  it('broadcast', (done) => {
    socket2.emit('joinBoard', 'anonymous')
    setTimeout(() => {
      socket1.emit('broadcast', {
        board: 'anonymous',
        data: testData.element
      })
      socket2.once('broadcast', data => {
        assert(data.id === testData.element.id)
        console.log('done...')
        done();
      })
    }, 100)
  })
})
