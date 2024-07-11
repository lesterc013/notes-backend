const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username }) // Shorthand notation within the curly -- when you have a variable with the same name as the object property. findOne returns the found document or null if not found

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash) // Find the bcrypt compare syntax in their readme

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  // jwt.sign(payload, secretOrPrivateKey, [options, callback])

  const userJWTPayload = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userJWTPayload, process.env.SECRET)

  response.status(200).send({
    token,
    username: user.username,
    name: user.name,
  })
})

module.exports = loginRouter
