const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  db: isDev ?
    'mongodb://localhost:27017/whiteBoard' :
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/whiteboard`,
  port: process.env.PORT|| 8080,
  // Save after 2 seconds of inactivity
  saveInterval: 1000 * 2,
  // Save after 30 seconds even if there is still activity
  maxSaveDelay: 1000 * 3,
}
