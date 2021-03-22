const mongoose = require('mongoose')

const languagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
)

const languages = mongoose.model('languages', languagesSchema)

module.exports = languages
