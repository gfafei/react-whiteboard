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
        break;
      case 'point':
        const line = this.elements.get(message.parent);
        if (!line) {
          logger.error(`cannot find line with id ${message.parent}`);
          return;
        }
        line.points.push(message)
        break;
      case 'clear':
        break;
      default:
        this.element.set(id, message);
        break;
    }
    this.delaySave();
  },
  delaySave: function() {
    if (this.saveTimeoutId !== undefined) clearTimeout(this.saveTimeoutId);
    this.saveTimeoutId = setTimeout(this.save.bind(this), config.saveInterval);
    if (Date.now() - this.lastSaveDate > config.maxSaveDelay) setTimeout(this.save.bind(this), 0);
  }
})
module.exports = mongoose.model('Board', BoardSchema);
