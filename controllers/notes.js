/**
 * Responsible for route handling
 */

const notesRouter = require('express').Router()
// Import Note model created so we can use Mongoose methods in the route handling
const Note = require('../models/note')
const User = require('../models/user')

/**
 * Get all notes
 */
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
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

/**
 * Post note
 */
notesRouter.post('/', async (request, response, next) => {
  const body = request.body
  
  // Can find the user who posted this note because the id should be in the request body
  // FSO Notes used body.userId but im using user to maintain consistency with the Schema's field name of user
  // Should work
  const user = await User.findById(body.user)
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