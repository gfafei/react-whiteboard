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
const boardMap = new Map();

io.on('connection', socket => {
  logger.info('connection')
  socket.on('error', noFail(error => {
    logger.error('ERROR', error)
  }))
  socket.on('broadcast', async data => {
    socket.broadcast.to(data.board).emit('broadcast', data.data);
    let board = boardMap.get(data.board);
    if (!board) {
      board = new Board({ _id: data.board })
    }
    board.updateElement(data.data)
  })
  socket.on('getBoard',async name => {
    socket.join(name)
    let board = boardMap.get(name);
    if (!board) {
      board = await Board.findById(name).exec();
      if (!board) {
        board = new Board({_id: name});
      }
      boardMap.set(name, board)
    }
    socket.emit('broadcast', board.toJSON());
  });
  socket.on('joinBoard', name => {
    socket.join(name)
  })
})

if (!module.parent) {
  server.listen(config.port);
  logger.info('server listening on ', config.port)
}

module.exports.server = server;
