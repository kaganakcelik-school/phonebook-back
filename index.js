require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

morgan.token('pusho', function (req, res) { return JSON.stringify(req.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :pusho'))

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

let persons = [
	{ 
		id: 1,
		name: 'Bob',
		number: '12313424242',
	},
	{
		id: 2,
		name: 'Rob',
		number: '56789044534',
	},
]

app.get('/', (request, response) => {
	response.send('<h1>phonebook server</h1>')
})

app.get('/info', (request, response) => {
	Person.find({}).then(persons => {
		response.send('<p>Phonebook has info for ' + persons.length + ' people <br/>' + new Date() + '</p>')
	})
})

app.get('/api/persons', (request, response) => {
	// response.json(persons)
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

app.get('/api/persons/:id', (request, response) => {

	Person.findById(request.params.id).then(person => {
		response.json(person)
	})
})

const generateId = () => {
	const maxId = persons.length > 0
	? Math.max(...persons.map(p => p.id))
	: 0
	return maxId+1
}

app.post('/api/persons', (request, response) => {
	const body = request.body
	console.log(request.body)

	if (!body.name) {
		return response.status(400).json({
			error: 'name missing'
		})
	}

	// if (persons.find(p => p.name === body.name)) {
	// 	return response.status(400).json({
	// 		error: 'name must be unique'
	// 	})
	// }

	if (!body.number) {
		return response.status(400).json({
			error: 'number missing'
		})
	}

	// const person = {
	// 	id: generateId(),
	// 	name: body.name,
	// 	number: body.number,
	// }

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person.save().then(savedPerson => {
		response.json(savedPerson)
	})

	// persons = persons.concat(person)

	// response.json(person)
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))


})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({error: 'malformatted id'})
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})