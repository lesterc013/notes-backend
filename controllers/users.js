// Route controller for creating users
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// Users are created when making a post request to /api/users (this path will be handled in app.js)
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    name: name,
    passwordHash: passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

// GET request
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', { content: 1, important: 1})
  return response.status(200).json(users)
})

module.exports = usersRouter