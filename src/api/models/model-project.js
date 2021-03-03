const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  description: {
    type: String,
    default: ''
  },
  technologies: {
    type: Array,
    required: true,
  },
  projectURL: {
    type: String,
    default: ''
  },
},
  {timestamps: true}
)

const projects = mongoose.model('projects', projectSchema)

module.exports = projects