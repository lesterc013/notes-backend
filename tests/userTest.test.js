const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const mongoose = require('mongoose')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      passwordHash: passwordHash
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    // Create the request body (i.e. JSON) that will be posted
    const user = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    // Expect 201 and Content-Type json
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Check db length to increase
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    // Check correct user added
    const usernames = usersAtEnd.map(users => users.username)
    assert(usernames.includes('mluukkai'))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})