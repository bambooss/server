require('dotenv').config()

import express from 'express'
const connectDB = require('./config/db')
const cors = require('cors')
import cookieParser from 'cookie-parser'

const indexRoute = require('./routes/router-index')

const httpPort = process.env.PORT || 8080

connectDB().then()

// init the app
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/', indexRoute)

app.listen(httpPort, () => {
  console.log(`Server is alive on port: ${httpPort} running as: ${process.env.NODE_ENVIROMENT}`)
})