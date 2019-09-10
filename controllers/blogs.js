const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')

blogsRouter.get('/', (req, res) => {
  Blog.find({}).then(blogs => {
    res.status(200).json(blogs.map(p => p.toJSON()))
  })
})

blogsRouter.post('/', (req, res, next) => {
  const newBlog = new Blog({
    ...req.body
  })
  console.log('req body: ', req.body)
  newBlog.save()
    .then(blog => {
      res.json(blog.toJSON())
    })
    .catch(err => next(err))
})

blogsRouter.get('/info', (req, res, next) => {
  Blog.countDocuments({})
    .then(count => {
      res.send(`
        <p>Blog has info for ${count} blogs</p>
        <p>${Date()}</p>
      `)
    })
    .catch(err => next(err))
})

blogsRouter.get('/:id', (req, res, next) => {
  Blog.findById(req.params.id)
    .then(blog => {
      if (blog) {
        res.json(blog.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

blogsRouter.delete('/:id', (req, res, next) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

blogsRouter.put('/:id', (req, res, next) => {
  const blog = {
    ...req.body
  }
  Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true
  })
    .then(updatedBlog => {
      res.json(updatedBlog.toJSON())
    })
    .catch(err => next(err))
})

module.exports = blogsRouter