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
	response.send('<p>Phonebook has info for ' + persons.length + ' people <br/>' + new Date() + '</p>')
})

app.get('/api/persons', (request, response) => {
	// response.json(persons)
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	// const person = persons.find(n => n.id === id)

	// if (person) {
	// 	response.json(person)
	// } else {
	// 	response.status(404).end()
	// }

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

app.put('/api/persons/:id', (request, response) => {
	const body = request.body
	const id = request.params.id

	if (!body.number) {
		return response.status(400).json({ 
			error: 'content missing' 
		})
	}

	Person.findById(request.params.id).then(person => {
		person.number = body.number
		person.save()
		response.json(person)
	})


	// Person.find({}).then(persons => {
	// 	persons.find(p => p.id === id) = {name: persons.find(p => p.id === id).name, number: body.number}
	// 	response.json(persons.find(p => p.id === Number(request.params.id)))
	// })

	// persons.find(p => p.id === Number(request.params.id)).number = body.number
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	// persons = persons.filter(p => p.id !== id)

	// Person.find({}).then(persons => {
	// 	persons = persons.filter(p => p.id !== id)
	// 	persons.forEach(p => p.save())
	// 	response.status(204).end()
	// })

	Person.deleteOne({_id: request.params.id}).then(person => {
		response.status(204).end()
	})

	// response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})