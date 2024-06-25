// Imports Node.js built in module to allow Node.js to transfer data over HTTP
// const http = require('http')
// require is also from CommonJS (a module formatting system) to assist us in importing the Node.js http module in this case

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express() // Creates an express application -- express is a better interface to deal with backend dev
const Note = require('./models/note')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response, next) => {
    response.status(404).json({
        'error': 'unknown endpoint'
    })
}

// Middleware
app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('dist'))

// Define the data to send back
let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

// Defining routes to the application. Think of it as like the views in django and how each route has a different function
app.get('/', (request, response) => {
    response.send('<h1>Notes Example</h1>')
})

app.get('/api/notes', (request, response) => {
    // Automatic transformation of JSON data
    // response.json(notes)

    // Using Mongo
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

// Get individual note
// Define parameters in routes to handle dynamism
app.get('/api/notes/:id', (request, response) => {
    // Was when we didn't use db
    // // Need to typecast Number because the params is a string
    // const id = Number(request.params.id)
    // // Filter does not work because we will return an array with the note inside it
    // // I assume when I GET this route, I just want to return the note object - hence use find
    // const note = notes.find(note => note.id === id)
    // if (note) {
    //     response.json(note)
    // }
    // else {
    //     response.status(404).end()
    // } 

    // Note we did not parse request.params.id into Number? That is because id is saved as a string -- see note.js when we returned the _id toString
    Note.findById(request.params.id)
        .then(note => {
            response.json(note)
    })
})

// Delete request
app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const generateID = () => {
    const maxID = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
    return maxID + 1
}

// Add new note
app.post('/api/notes', (request, response) => {
    
    // Without express.json(), the body property of the request will be undefined. 
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content is missing'
        })
    }

    // New note is created with the Note constructor we passed in from note.js
    const note = new Note ({
        content: body.content,
        important: body.important || false,
        // id: generateID(), // Don't need id cos mongo auto generates
    })

    // Was previously for the notes variable set within this js file. Now need use db
    // notes = notes.concat(note)

    // Response is set inside the callback fn for save i.e. after Promise is resolved - only sent if operation succeeds
    note.save()
        .then(savedNote => {
            response.json(savedNote)
    })

})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})