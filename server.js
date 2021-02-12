require('dotenv').config()

const http = require('http')
const express = require('express')
const connectDB = require('./config/db')

const httpPort = process.env.PORT

connectDB()

// init the app
const app = express()
const httpServer = http.createServer(app)

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', (req, res) => {
  res.send('It works')
})

httpServer.listen(httpPort, () => {
  console.log(`Server is alive on port: ${httpPort} running as: ${process.env.NODE_ENVIROMENT}`)
})