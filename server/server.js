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

const loadBoard = async (name) => {
  if (boardMap.has(name)) {
    return boardMap.get(name)
  } else {
    let board = await Board.findById(name).exec();
    if (!board) {
      board = new Board({ _id: name });
    }
    boardMap.set(name, board);
    return board;
  }
}
io.on('connection', socket => {
  logger.info('connection')
  socket.on('error', noFail(error => {
    logger.error('ERROR', error)
  }))
  socket.on('broadcast', async data => {
    socket.broadcast.to(data.board).emit('broadcast', data.data);
    const board = await loadBoard(data.board);
    board.updateElement(data.data)
  })
  socket.on('getBoard',async name => {
    socket.join(name)
    const board = await loadBoard(name);
    socket.emit('broadcast', board.toJSON());
  });
  socket.on('joinBoard', name => {
    socket.join(name)
  });
})

if (require.main === module) {
  server.listen(config.port);
  logger.info('server listening on ', config.port)
}

module.exports.server = server;
