// Initialising app as an express object
const express = require('express')
require('express-async-errors')
const app = express()

// Import all the required modules
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const cors = require('cors')
const mongoose = require('mongoose')

// To allow for more flexible querying
mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => logger.error('error connecting to MongoDB', error.message))

// Set up the pre-required middleware
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Launching the router
app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// End-required middleware for error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
