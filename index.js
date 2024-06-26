/**
 * Only responsible for setting up the server now
 * Logic should be handled in app.js
 */

const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})