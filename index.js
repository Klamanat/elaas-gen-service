// app.js
const express = require('express')
const { specs, swaggerUi } = require('./swagger')
const appRouter = require('./routes/index')
var bodyParser = require('body-parser')

const app = express()
const port = 3030

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use('/api/app', appRouter)

app.get('/', (req, res) => {
  res.send('Hello, Swagger!')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})