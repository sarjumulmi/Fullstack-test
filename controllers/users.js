const express = require('express')
const userRouter = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

userRouter.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', { author: 1, title: 1, url: 1 })
    console.log('users: ', users)
    res.json(users.map( u  => u.toJSON()))
  } catch (error) {
    next(error)
  }
})

userRouter.post('/', async (req, res, next) => {
  const { username, password, name } = req.body
  if (password.length < 3) {
    return res.status(400).send({ error: 'Password must be minimum 3 characters long' })
  }
  const saltRounds = 10
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username: username,
      name: name,
      passwordHash
    })
    const savedUser = await user.save()
    res.json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = userRouter