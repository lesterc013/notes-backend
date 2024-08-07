/**
 * Responsible for route handling
 */

const notesRouter = require('express').Router()
// Import Note model created so we can use Mongoose methods in the route handling
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


/**
 * Get all notes
*/
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user')
  return response.json(notes)
})

/**
 * Get specific note by id
*/
notesRouter.get('/:id', async (request, response, next) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

// Function to get token from HTTP request header
const getTokenFrom = request => {
  // request.get is an express method that returns the HTTP request header field (authorization in this case). Returns null if nothing
  // Should look something like: Basic <credentials>
  const authorization = request.get('authorization')
  // From MDN: The field in Authorization header will look something like this: Authorization: Basic <credentials> -- Basic and Bearer are just different authentication schemes
  if (authorization && authorization.startsWith('Bearer ')) {
    // Get rid of the 'Bearer ' cos we just want the token
    return authorization.replace('Bearer ', '')
  }
  return null
}

/**
 * Post note
 */
notesRouter.post('/', async (request, response, next) => {
  const body = request.body
  
  const token = getTokenFrom(request)
  // jwt.verify(token, secretOrPublicKey, [options, callback]) -- returns the PAYLOAD decoded if everything is valid. Remember our payload was set as:
  // const userJWTPayload = {
  //   username: user.username,
  //   id: user._id
  // }
  const payload = jwt.verify(token, process.env.SECRET)
  if (!payload.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }
  // Note: findById can take both id in String or Object _id type
  const user = await User.findById(payload.id)
  // Create new Mongoose Note document first, then save it
  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })
  const savedNote = await note.save()
  // Then need to add the savedNote OBJECT ID to this user's notes array which stored the OBJECT IDs of this user's notes
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})

/**
 * Delete specific note by id
 */
// Without try and catch because imported express-async-errors library in app.js
notesRouter.delete('/:id', async (request, response, next) => {
  const deletedNote = await Note.findByIdAndDelete(request.params.id)
  if (deletedNote) {
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

/**
 * Update note
 */
notesRouter.put('/:id', async (request, response, next) => {
  // The updated note should have been sent via the frontend
  const body = request.body
  // findByIdAndUpdate expects a JS Object for the update and not a Document
  const update = {
    content: body.content,
    important: body.important
  }
  const updatedNote = await Note.findByIdAndUpdate(request.params.id, update, {
    new: true // To return the modified document rather than original
  })
  response.json(updatedNote)
})

module.exports = notesRouter