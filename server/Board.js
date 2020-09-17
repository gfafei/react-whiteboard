const mongoose = require('mongoose');
const config = require('../config');
const Logger = require('./Logger');
const logger = new Logger('db')

mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', logger.error);
db.once('open', () => {
  logger.info('db connected')
});

const BoardSchema = new mongoose.Schema({
  _id: { type: Object },
  elements: { type: Map, default: new Map() }
});

module.exports = mongoose.model('Board', BoardSchema);
