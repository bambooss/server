import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import gravatar from 'gravatar'
const model_users = require('../models/model-user')

/**
 * Controller to create new users,
 * It takes in the new user details, does a few checks
 * and modifications and saves it to the DB
 * and will return the user and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.user - user's data object
 * @param {object} res - Response object from express router
 * @method POST
 * @route /auth/user/register
 * @access Public
 * @author Gabor
 */
exports.createUser = async (req: Request<registerUserRequest>,
                            res: Response<registerUserResponse>) => {
  try {
    let { user } = req.body

    // Check if user already exists
    if(await model_users.findOne({email: user.email})) {
      return res.status(409).json({
        status: 409,
        message: 'User already exists'
      })
    }

    // Compare passwords
    if(user.password !== user.password2) {
      return res.status(400).json({
        status: 400,
        message: 'Passwords do not match'
      })
    }

    // Hash password
    user.password = await bcrypt.hash(user.password, 11)

    // Get avatar from Gravatar
    const avatar = await gravatar.url(user.email, {
      s: '200',
      r: 'pg',
      d: 'mm',
    })

    // Construct Gravatar URL
    user.avatar = `https:${avatar}`

    // Verify and create social profiles
    user = verifyAndCreateSocial(user)

    // Create user model
    user = await model_users.create(user)

    // Generate auth token
    const token = await user.generateAuthToken()

    // Hide password before sending it in the response
    // DB not affected
    user.password = '***********'

    return res.status(201).json({
      status: 201,
      message: 'User was created successfully',
      token,
      user
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

exports.loginUser = async (req: Request, res: Response) => {
  try {
    const { user } = req.body

    const foundUser = await model_users.findOne({email: user.email})

    if(!foundUser) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      })
    }

    const isCorrectPassword = await bcrypt.compare(user.password, foundUser.password)

    if(!isCorrectPassword) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      })
    }

    const token = await foundUser.generateAuthToken()

    foundUser.password = '***********'

    return res.status(200).json({
      status: 200,
      message: 'Login successful',
      token,
      user: foundUser
    })

  } catch (error) {
      console.log(error)
      res.status(500).json({
        status: 500,
        message: error.message
      })
  }
}

// Creates social profiles URLs based on usernames
const verifyAndCreateSocial = (user: { profiles: { githubURL: string; gitlabURL: string; bitbucketURL: string; linkedinURL: string } }) => {
  if(user.profiles.githubURL !== '') {
    user.profiles.githubURL = `https://github.com/${user.profiles.githubURL}`
  }
  if(user.profiles.gitlabURL !== '') {
    user.profiles.gitlabURL = `https://gitlab.com/${user.profiles.gitlabURL}`
  }
  if(user.profiles.bitbucketURL !== '') {
    user.profiles.bitbucketURL = `https://bitbucket.org/${user.profiles.bitbucketURL}/`
  }
  if(user.profiles.linkedinURL !== '') {
    user.profiles.linkedinURL = `https://www.linkedin.com/in/${user.profiles.linkedinURL}/`
  }
  return user
}

interface registerUserRequest {
  body: {
    user: {
      username: string,
      email: string,
      password: string,
      password2: string,
      profiles: {
        githubURL: string,
        gitlabURL: string,
        bitbucketURL: string,
        linkedinURL: string
      },
      pLanguages: string[],
      sLanguages: string[],
      bio: string
    }
  }
}

interface registerUserResponse {
  status: number,
  message?: string,
  token?: string,
  user?: Record<string, unknown>
}