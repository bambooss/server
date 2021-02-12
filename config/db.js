const mongoose = require('mongoose')

let connectionURI = ''

if (process.env.NODE_ENVIROMENT === 'production') {
  connectionURI = process.env.MONGO_URI
} else {
  connectionURI = process.env.TEST_MONGO_URI
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(connectionURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })

    console.log(`MongoDB connected ${conn.connection.host}`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = connectDB