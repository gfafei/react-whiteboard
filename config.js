const isDev = process.env.NODE_ENV === 'develop'
module.exports = {
  db: isDev ?
    'mongodb://localhost:27017/whiteboard' :
    `mongodb://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@${process.env['MONGO_HOST']}:3717`,
  port: process.env.PORT|| 8080,
  // Save after 2 seconds of inactivity
  saveInterval: 1000 * 2,
  // Save after 30 seconds even if there is still activity
  maxSaveDelay: 1000 * 3,
}
