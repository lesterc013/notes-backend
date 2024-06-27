const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')

const api = supertest(app)

// Clears out the database before each test, and then saves the two notes
beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, helper.initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')
  const contents = response.body.map(e => e.content)

  assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Get all the notes as JSON
  const notesAtEnd = await helper.notesInDb()
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

  // Check if the right note has been added
  const contents = notesAtEnd.map(note => note.content)
  assert(contents.includes('async/await simplifies making async calls'))
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb()

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
  // Retrieve the first note in the db -- doesnt have to be the first, but in this example we used the first
  // This is purely the notes in the db only -- not making any HTTP requets so we dont need to parse through HTTP response
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]
  
  // Then, we get request to this note's specific id -- this will return the entire HTTP response object
  const httpResponseObject = await api
  .get(`/api/notes/${noteToView.id}`)
  .expect(200)
  .expect('Content-Type', /application\/json/)

  // httpResponseObject.body should then contain the note object 
  assert.deepStrictEqual(httpResponseObject.body, noteToView)
})

test('a specific note can be deleted', async () => {
  const initialNotes = await helper.notesInDb()
  const noteToDelete = initialNotes[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  // Check that there is one less note
  assert.strictEqual(notesAtEnd.length, initialNotes.length - 1)

  // Check that the correct note was deleted
  const noteToDeleteContent = noteToDelete.content
  const endContent = notesAtEnd.map(note => note.content)
  assert(!endContent.includes(noteToDeleteContent))
})

after(async () => {
  await mongoose.connection.close()
})