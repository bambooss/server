import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
  },
  username: {
    type: String,
    required: [true, 'Please include your username'],
    trim: true,
    minLength: [3, 'The username must be at least 3 characters long'],
    maxLength: [20, 'The username must be at most 20 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Please include your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  bio: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
      },
      lastUsed: {
        type: Date,
        required: true,
        default: Date.now(),
      }
    }
  ]
},
  { timestamps: true }
  )

const users = mongoose.model('users', userSchema)

export default users