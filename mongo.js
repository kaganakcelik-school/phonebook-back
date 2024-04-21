const mongoose = require('mongoose')

if (process.argv.length<3) {
	console.log('give password as argument')
	process.exit(1)
}

const password = process.argv[2]

const url = 
	`mongodb+srv://kaganakcelikschool:${password}@fullstackopencluster.n5xb0ra.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=fullstackopencluster`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)



if (process.argv.length===3) {
	console.log('phonebook')
	Person.find({}).then(result => {
		result.forEach(note => {
			console.log(`${note.name} ${note.number}`)
		})
		mongoose.connection.close()
	})	
} else if (process.argv.length===5) {
	const person = new Person({
		name: process.argv[3],
		number: process.argv[4],
	})
	
	person.save().then(result => {
		console.log('note saved!')
		mongoose.connection.close()
	})
} else {
	console.log('your not putting in enough info bro')
	mongoose.connection.close()
}
