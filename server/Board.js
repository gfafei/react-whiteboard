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
BoardSchema.method({
  updateElement: function(message) {
    const id = message.id;
    switch(message.type) {
      case 'delete':
        this.elements.delete(id)
        break;
      case 'update':
        const element = this.elements.get(id);
        if (!element) {
          logger.error(`cannot find element with id ${message.id}`);
          return;
        }
        element.x2 = message.x2;
        element.y2 = message.y2;
        break;
      case 'points':
        const line = this.elements.get(message.parent);
        if (!line) {
          logger.error(`cannot find element with id ${message.parent}`);
          return;
        }
        line.points.push(...message.points)
        break;
      case 'clear':
        this.elements.clear();
        break;
      default:
        this.elements.set(id, message);
        break;
    }
    this.delaySave();
  },
  delaySave: function() {
    if (!this.lastSaveDate) this.lastSaveDate = Date.now()
    if (this.saveTimeoutId !== undefined) clearTimeout(this.saveTimeoutId);
    this.saveTimeoutId = setTimeout(this.doSave.bind(this), config.saveInterval);
    if (Date.now() - this.lastSaveDate > config.maxSaveDelay) {
      setTimeout(this.doSave.bind(this), 0);
    }
  },
  doSave: function() {
    this.lastSaveDate = Date.now();
    this.save();
  }
})
module.exports = mongoose.model('Board', BoardSchema);
