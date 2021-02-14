require('dotenv').config()

import http = require('http')
import express = require('express')
const connectDB = require('./config/db')

const httpPort = process.env.PORT || 8080

connectDB().then()

// init the app
const app = express()
const httpServer = http.createServer(app)

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', (req: express.Request, res: express.Response) => {

  res.send('It works')
})

httpServer.listen(httpPort, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is alive on port: ${httpPort} running as: ${process.env.NODE_ENVIROMENT}`)
})