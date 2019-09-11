const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => (
  blogs.reduce((prevValue, currentBlog) => {
    return prevValue + currentBlog.likes
  }, 0)
)

const favoriteBlog = (blogs) => (
  blogs.reduce((prevBlog, currentBlog) => {
    if (prevBlog.likes && prevBlog.likes >= currentBlog.likes) {
      return prevBlog
    } else {
      return currentBlog
    }
  }, {})
)

const mostBlogs = (blogs) => {
  const authorCount = _.countBy(blogs, (blog) => blog.author)
  return Object.keys(authorCount).reduce((prevValue, currentValue) => {
    if (authorCount[prevValue] >= authorCount[currentValue]) {
      return { author: prevValue, blogs: authorCount[prevValue] }
    } else {
      return { author: currentValue, blogs: authorCount[currentValue] }
    }
  }, {})
}

const mostLikes = (blogs) => {
  const authorWithLikes = _(blogs).groupBy('author')
    .map((objs, key) => ({
      'author': key,
      'likes': _.sumBy(objs, 'likes') }))
    .value()
  return _.maxBy(authorWithLikes, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}