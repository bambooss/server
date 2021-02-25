import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
// import crypto from 'crypto'
import gravatar from 'gravatar'
const model_users = require('../models/model-user')

/**
 * Controller to create new users,
 * It takes in the new user details, does a few checks
 * and modifications and saves it to the DB
 * and will return the user and a 201 created message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.user - user's data object
 * @param {object} res - Response object from express router
 * @method POST
 * @route /auth/user/register
 * @access Public
 * @author Gabor
 */
exports.createUser = async (req: Request<RegisterUserRequest>,
                            res: Response<UserResponse>) => {
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

/**
 * Controller to log in existing users,
 * It takes in the email and password,
 * checks for existing users, compares passwords
 * and will return the user and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.user - user's data object
 * @param {object} res - Response object from express router
 * @method POST
 * @route /auth/user/login
 * @access Public
 * @author Gabor
 */
exports.loginUser = async (req: Request<LoginUserRequest>,
                           res: Response<UserResponse>) => {
  try {
    const { user } = req.body
    user.email = user.email.toLowerCase().trim()

    // Checks for existing user in DB
    const foundUser = await model_users.findOne({email: user.email})

    // If there is no user responds with invalid credentials
    if(!foundUser) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      })
    }

    // Compares passwords
    const isCorrectPassword = await bcrypt.compare(user.password, foundUser.password)

    // If passwords don't match with the one in the DB responds with invalid credentials
    if(!isCorrectPassword) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      })
    }

    // Generates new auth token
    const token = await foundUser.generateAuthToken()

    // Hide password before sending it in the response
    // DB not affected
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

// exports.forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { user } = req.body
//     user.email = user.email.toLowerCase().trim()
//
//     // Checks for existing user in DB
//     const foundUser = await model_users.findOne({email: user.email})
//
//     console.log(foundUser)
//     if(!foundUser) {
//       return res.status(200).json({
//         status: 200,
//         message: 'If the email is registered you will receive a password reset email shortly'
//       })
//     }
//
//     foundUser.resetPasswordToken.token = crypto.randomBytes(16).toString('hex')
//     foundUser.resetPasswordToken.createdAt = Date.now()
//
//     await model_users.create(foundUser).then()
//
//     // Creating a reset link to send in the email
//     const resetLink = `http://localhost:3000/reset/${foundUser.resetPasswordToken}`
//
//     return res.status(200).json({
//       status: 200,
//       message: 'If the email is registered you will receive a password reset email shortly'
//     })
//
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       status: 500,
//       message: error.message
//     })
//   }
// }

exports.testController = async (req: Request, res: Response) => {
  let cookies = req.headers.cookie

  if (!cookies) {

    return res.status(401).json({
      status: 401,
      message: 'Missing authentication'
    })
  }

  res.send('happy days')

}

// exports.getUserProfile = async (req: Request, res: Response) => {
//   try {
//
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       status: 500,
//       message: error.message
//     })
//   }
// }

/////////////
// HELPERS //
/////////////

// Creates social profiles URLs based on usernames
const verifyAndCreateSocial = (user:
                                 {
                                   githubURL: string;
                                   gitlabURL: string;
                                   bitbucketURL: string;
                                   linkedinURL: string
                                 }) => {
  if(user.githubURL !== '') {
    user.githubURL = `https://github.com/${user.githubURL}`
  }
  if(user.gitlabURL !== '') {
    user.gitlabURL = `https://gitlab.com/${user.gitlabURL}`
  }
  if(user.bitbucketURL !== '') {
    user.bitbucketURL = `https://bitbucket.org/${user.bitbucketURL}/`
  }
  if(user.linkedinURL !== '') {
    user.linkedinURL = `https://www.linkedin.com/in/${user.linkedinURL}/`
  }
  return user
}

////////////////
// INTERFACES //
////////////////

interface RegisterUserRequest {
  body: {
    user: {
      username: string,
      email: string,
      password: string,
      password2: string,
      githubURL: string,
      gitlabURL: string,
      bitbucketURL: string,
      linkedinURL: string,
      pLanguages: string[],
      sLanguages: string[],
      bio: string
    }
  }
}

interface UserResponse {
  status: number,
  message?: string,
  token?: string,
  user?: Record<string, unknown>
}

interface LoginUserRequest {
  body: {
    user: {
      email: string,
      password: string,
    }
  }
}