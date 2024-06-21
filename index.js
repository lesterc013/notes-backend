// Imports Node.js built in module to allow Node.js to transfer data over HTTP
// const http = require('http')
// require is also from CommonJS (a module formatting system) to assist us in importing the Node.js http module in this case

const express = require('express')
const cors = require('cors')
const app = express() // Creates an express application -- express is a better interface to deal with backend dev

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

app.use(express.json())
app.use(requestLogger)
app.use(cors())

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
    response.json(notes)
})

// Define parameters in routes to handle dynamism
app.get('/api/notes/:id', (request, response) => {
    // Need to typecast Number because the params is a string
    const id = Number(request.params.id)
    // Filter does not work because we will return an array with the note inside it
    // I assume when I GET this route, I just want to return the note object - hence use find
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    }
    else {
        response.status(404).end()
    } 
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

    const note = {
        content: body.content,
        important: Boolean(body.important) || false,
        id: generateID(),
    }

    notes = notes.concat(note)

    response.json(note) 
})

// // Now that i've imported the http module, I can use its functionalities
// const app = http.createServer((request, response) => {
//     // Defines the response header
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     // Defines what to send to the user -- which could be HTML, JSON, text etc
//     response.end(JSON.stringify(notes))
// })

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})