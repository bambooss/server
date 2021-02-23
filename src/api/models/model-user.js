import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

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
    match: [/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: [8, 'The password must be at least 8 characters long'],
    maxlength: [128, 'The username must be at most 128 characters long'],
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
  resetPasswordToken: {
    token: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    }
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

//this method generates an auth token for the user
userSchema.methods.generateAuthToken = async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this
  const token = jwt.sign(
    { _id: user._id, name: user.username, email: user.email },
    process.env.BEARER_TOKEN_SECRET
  )
  user.tokens = user.tokens.concat({
    token: token,
    createdAt: Date.now(),
    lastUsed: Date.now()
  })
  await user.save()
  return token
}

const users = mongoose.model('users', userSchema)

module.exports = users