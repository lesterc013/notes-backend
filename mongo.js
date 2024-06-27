require('dotenv').config()
const mongoose = require('mongoose')

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]

const url = process.env.TEST_MONGODB_URI

mongoose.set('strictQuery', false)

// mongoose.connect(url).then(() => {
//   console.log('Connected to', url)
//   const noteSchema = new mongoose.Schema({
//     content: String,
//     important: Boolean,
//   })
// })

const connectToDB = async (url) => {
  try {
    await mongoose.connect(url)
    console.log('Connected to', url)
  } catch (error) {
    console.log('Error connecting to db', error.message)
  }
}

connectToDB(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

const note1 = new Note({
  content: 'HTML is easy',
  important: true,
})

const note2 = new Note({
  content: 'Testing is tough',
  important: false
})

note1.save().then(result => {
  console.log('note1 saved!')
})

note2.save().then(result => {
  console.log('note2 saved!')
  mongoose.connection.close()
})

//   Note.find({}).then(result => {
//     result.forEach(note => {
//       console.log(note)
//     })
//     mongoose.connection.close()
//   })
// })