const mongoose = require('mongoose')

const technologiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    }
  ],
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'projects',
    }
  ],
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobs',
    }
  ],
  status: {
    // Statuses: 0-Pending; 1-Active; 2-Deleted
    type: Number,
    required: true,
    default: 0
  }
},
  {timestamps: true}
  )

const technologies = mongoose.model('technologies', technologiesSchema)

module.exports = technologies