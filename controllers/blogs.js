const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Blog = require('../models/Blog')
const User = require('../models/User')
const Comment  = require('../models/Comment')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 }).populate('comments', { content: 1 })
  res.status(200).json(blogs.map(p => p.toJSON()))
})

blogsRouter.post('/', async (req, res, next) => {
  const body = req.body
  const token = req.token // token from tokenExtractor middleware
  try {
    const decodedToken = jwt.verify(token, process.env.JWTSECRET)
    if (!token || !decodedToken.id) {
      res.status(401).send({ error: 'unauthorized access' })
      return
    }
    const user = await User.findById(decodedToken.id)
    const newBlog = new Blog({
      author: body.author,
      title: body.title,
      url: body.url,
      user: user._id
    })
    const blog =  await newBlog.save()
    user.blogs = user.blogs.concat(blog._id)
    await user.save()
    const b = await Blog.findOne(blog).populate('user', { username: 1, name: 1 })
    console.log('saved blog: ', b.toJSON())
    return res.json(b.toJSON())
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
    const blog = await Blog.findById(req.params.id).populate('comments', { content: 1 })
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
  const token = req.token
  try {
    const decodedToken = token && jwt.verify(token, process.env.JWTSECRET)
    if (!token || !decodedToken.id) {
      res.status(401).send({ error: 'unauthorized access' })
      return
    }
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(req.params.id)
    if (blog.user.toString() !== decodedToken.id) {
      return res.status(401).json({ error: 'Unautharized. blog doesnot belong to user' })
    }
    await Blog.findByIdAndRemove(req.params.id)
    user.blogs = user.blogs.filter(b => b.id !== blog.id)
    await user.save()
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

blogsRouter.get('/:id/comments', async (req, res) => {
  const comments = await Comment.find({blog: req.params.id })
  res.status(200).json(comments.map(c => c.toJSON()))
})

blogsRouter.post('/:id/comments', async (req, res, next) => {
  const token = req.token
  try {
    const decodedToken = token && jwt.verify(token, process.env.JWTSECRET)
    if (!token || !decodedToken.id) {
      res.status(401).send({ error: 'unauthorized access' })
      return
    }
    const blog = await Blog.findById(req.params.id)
    const newComment = new Comment({
      content: req.body.content,
      blog: blog._id
    })
    const comment =  await newComment.save()
    blog.comments = blog.comments.concat(comment._id)
    await blog.save()
    const updatedBlog = await Blog.findById(blog).populate('comments', { content: 1 })
    console.log(updatedBlog.toJSON())
    return res.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter