const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.status(200).json(blogs.map(p => p.toJSON()))
})

blogsRouter.post('/', async (req, res, next) => {
  const newBlog = new Blog({
    ...req.body
  })
  try {
    const blog =  await newBlog.save()
    res.json(blog.toJSON())
  } catch (error) {
    next(error)
  }
})

blogsRouter.get('/info', async (req, res, next) => {
  try {
    const count = await Blog.countDocuments({})
    res.send(`
      <p>Blog has info for ${count} blogs</p>
      <p>${Date()}</p>
    `)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (blog) {
      res.json(blog.toJSON())
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const blog = {
    ...req.body
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
      new: true
    })
    res.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter