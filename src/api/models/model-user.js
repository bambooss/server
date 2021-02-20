import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: '',
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
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: [8, 'The password must be at least 3 characters long'],
    maxlength: [128, 'The username must be at most 20 characters long'],
    trim: true,
  },
  profiles: {
    githubURL: {
      type: String,
      trim: true,
      default: '',
    },
    gitlabURL: {
      type: String,
      trim: true,
      default: '',
    },
    bitbucketURL: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinURL: {
      type: String,
      trim: true,
      default: '',
    },
  },
  pLanguages: {
    type: Array,
    default: [],
  },
  sLanguages: {
    type: Array,
    default: [],
  },
  bio: {
    type: String,
    default: '',
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