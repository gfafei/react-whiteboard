
module.exports = {
  db: 'mongodb://localhost:27017/whiteboard',
  port: 8080,
  // Save after 2 seconds of inactivity
  saveInterval: 1000 * 2,
  // Save after 30 seconds even if there is still activity
  maxSaveDelay: 1000 * 3,
}
