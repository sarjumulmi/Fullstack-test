const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const User = require('../models/User')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const user = new User({ username: 'admin', passwordHash: 'secret', name: 'Luka' })
  await user.save()
})

describe('when there is initially one user in db', () => {
  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDB()
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'supersecret',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('username must be unique and will fail user creation if duplicate name exists', async () => {
    const usersAtStart = await helper.usersInDB()
    const newUser = {
      username: 'admin',
      name: 'Matti Luukkainen',
      password: 'supersecret',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(result.body.error).toContain('`username` to be unique')
    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('username needs to be at least 3 characters long', async () => {
    const newUser = {
      username: 'ar',
      name: 'Matti Luukkainen',
      password: 'supersecret',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(result.body.error).toContain('minimum allowed length (3)')
  })

  test('password needs to be at least 3 characters long', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Matti Luukkainen',
      password: 'se',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(result.body.error).toContain('Password must be minimum 3 characters long')
  })
})

afterAll(async () => {
  mongoose.connection.close()
})