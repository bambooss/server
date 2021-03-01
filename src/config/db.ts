import mongoose = require('mongoose')
const config = require('config')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.get('dbHost') ?? 'mongodb://localhost:27017', {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })

    // eslint-disable-next-line no-console
    console.log(`MongoDB connected ${conn.connection.host}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  }
}

module.exports = connectDB