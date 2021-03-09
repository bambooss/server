const mongoose = require('mongoose')

const jobsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sortTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  technologies: {
    type: Array,
    required: true
  },
  project: {
    type: mongoose.Types.ObjectId,
    ref: 'projects',
  }
})

const jobs = mongoose.model('jobs', jobsSchema)

module.exports = jobs