const mongoose = require('mongoose')

const jobsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    sortTitle: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    positions: {
      type: Number,
      default: 1,
    },
    technologies: {
      type: Array,
      required: true
    },
    project: {
      type: mongoose.Types.ObjectId,
      ref: 'projects'
    }
  },
  { timestamps: true }
)

const jobs = mongoose.model('jobs', jobsSchema)

module.exports = jobs
