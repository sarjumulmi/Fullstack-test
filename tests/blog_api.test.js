const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/Blog')
const helper = require('./test_helper')

const blogApi = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const blogPromises = blogObjects.map(b => b.save())
  await Promise.all(blogPromises)
})

describe('GET Blog API', () => {
  test('blogs are returned as JSON', async () => {
    await blogApi
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
  })

  test('all blogs are returned', async () => {
    const resp = await blogApi.get('/api/blogs')
    expect(resp.body.length).toBe(helper.initialBlogs.length)
  })

  test('a specific blog is returned with the returned blogs', async () => {
    const resp = await blogApi.get('/api/blogs')
    const authors = resp.body.map( r => r.author)
    expect(authors).toContain('Michael Chan')
  })

  test('returned blogs have a "id" property', async () => {
    const resp = await blogApi.get('/api/blogs')
    expect(resp.body[0].id).toBeDefined()
  })
})

describe('POST Blogs API', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }
    await blogApi
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
    const allBlogs = await helper.blogsInDB()
    expect(allBlogs.length).toBe(helper.initialBlogs.length + 1)
    const authors = allBlogs.map(b => b.author)
    expect(authors).toContain('Robert C. Martin')
  })

  test('if a blog is added without "likes" property, it is defaulted to zero', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }
    const resp = await blogApi
      .post('/api/blogs')
      .send(newBlog)
    expect(resp.body.likes).toBe(0)
  })

  test('if a blog is added without title, a 400 response is returned', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }
    await blogApi
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('if a blog is added without url, a 400 response is returned', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
    }
    await blogApi
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})