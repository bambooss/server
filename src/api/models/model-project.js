const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    sortName: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
    description: {
      type: String,
      default: ''
    },
    technologies: {
      type: Array,
      required: true
    },
    projectURL: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

const projects = mongoose.model('projects', projectSchema)

module.exports = projects
