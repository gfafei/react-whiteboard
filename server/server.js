const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const config = require('../config');
const Logger = require('./Logger');
const logger = new Logger('server');
const Board = require('./Board');


function noFail(fn) {
  return function noFailWrapped(arg) {
    try {
      return fn(arg);
    } catch (e) {
      console.trace(e);
    }
  }
}

io.on('connection', socket => {
  logger.info('connection')
  socket.on('error', noFail(error => {
    logger.error('ERROR', error)
  }))
  socket.on('broadcast', noFail(message => {
    //TODO
  }))
  socket.on('getBoard',async name => {
    let board = await Board.findById(name).exec();
    if (!board) {
      board = await Board.create({ _id: name })
    }
    socket.emit('broadcast', board);
  })
})

if (!module.parent) {
  server.listen(config.port);
  logger.info('server listening on ', config.port)
}

module.exports.server = server;
