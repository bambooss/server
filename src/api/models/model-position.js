const mongoose = require('mongoose')

const positionSchema = new mongoose.Schema(
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
    numberOfPositions: {
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

const positions = mongoose.model('positions', positionSchema)

module.exports = positions
