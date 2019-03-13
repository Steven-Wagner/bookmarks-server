const app = require('./app')
const {PORT} = require('./config')
const knex = require('knex')

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`)
})

db = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

app.set('db', db);