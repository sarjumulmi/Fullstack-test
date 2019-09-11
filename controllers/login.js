const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/User')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  const isPasswordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
  if (!(user && isPasswordCorrect)) {
    return res.status(401).json({ error: 'invalid username/password' })
  }
  const token = jwt.sign({ username, id: user._id }, process.env.JWTSECRET)
  res.status(200).send({ token, username, name: user.name })
})

module.exports = loginRouter