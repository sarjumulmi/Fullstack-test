const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0-ociin.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true
})
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(err => {
    console.log('error connecting to MongoDB: ', err.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Perosn', personSchema)

if (process.argv.length < 3) {
  console.log('password is required')
  process.exit(1)
}

if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    persons.forEach(p => console.log(p))
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  const newPerson = new Person({
    name,
    number
  })
  newPerson.save().then(() => {
    console.log('person saved')
    mongoose.connection.close()
  })
}