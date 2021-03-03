const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')

const indexRoute = require('./routes/router-index')

const httpPort = process.env.PORT || 8080

connectDB().then()

// init the app
const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/', indexRoute)

app.listen(httpPort, () => {
  console.log(`Server is alive on port: ${httpPort} running as: ${process.env.NODE_ENV}`)
})

module.exports = app