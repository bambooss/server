import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import gravatar from 'gravatar'
import mongoose from 'mongoose'
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
 * @route /user/register
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
 * @route /user/login
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

/**
 * Controller to get user profile,
 * It accepts an user ID checks it against the database
 * and will return the user and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decode._id - user id
 * @param {object} res - Response object from express router
 * @method GET
 * @route /user
 * @access Private
 * @author Gabor
 */
exports.getUserProfile = async (req: Request, res: Response<UserResponse>) => {
  try {
    // Gets user ID
    const id = req.body.decoded._id

    // Checks if user ID is a string
    if(typeof id === 'string') {
      // Checks if user ID is a valid mongo ID
      if(mongoose.Types.ObjectId.isValid(id)) {
        // Gets user data form DB and removes unnecessary fields
        const user = await model_users
          .findById(id)
          .select(
            [
              '-tokens',
              '-password',
              '-resetPasswordToken',
              '-__v',
              '-createdAt',
              '-updatedAt',
              '-_id'
            ]
          )
        // If user found returns the user
        if(user) {
          return res.status(200).json({
            status: 200,
            message: `Profile of ${user.username}`,
            user
          })
        }
      }
    }
      // Returns auth error if any if checks fail
      return res.status(403).json({
        status: 403,
        message: 'Not authorized'
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
 * Controller to update user profile,
 * It gets the user ID from auth middleware checks it against the database
 * and will return the user and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decode._id - user id from auth middleware
 * @param {object} res - Response object from express router
 * @method PATCH
 * @route /user
 * @access Private
 * @author Gabor
 */
exports.updateUser = async (req: Request, res: Response<UserResponse>) => {
  try {
    // Gets user ID
    const id = req.body.decoded._id
    let {user} = req.body

    user.email = user.email.toLowerCase().trim()

    // Verify and create social profiles
    user = verifyAndCreateSocial(user)

    if(typeof id === 'string') {
      // Checks if user ID is a valid mongo ID
      if (mongoose.Types.ObjectId.isValid(id)) {
        // Update user and return new user details
        const newUser = await model_users.findByIdAndUpdate(id, user, { new: true })

        // Hide password before sending it in the response
        // DB not affected
        newUser.password = '***********'

        // Generates a new auth token if the username or email has changed
        if(newUser.email !== req.body.decoded.email || newUser.username !== req.body.decoded.username) {
          const token = await newUser.generateAuthToken()

          return res.status(200).json({
            status: 200,
            message: 'Login successful',
            user: newUser,
            token
          })
        }

        return res.status(200).json({
          status: 200,
          message: 'Login successful',
          user: newUser
        })
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

/**
 * Controller to mark user for deletion,
 * It accepts an user ID checks it against the database
 * and will return a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded._id - user id
 * @param {object} res - Response object from express router
 * @method Delete
 * @route /user
 * @access Private
 * @author Gabor
 */
exports.deleteUser = async (req: Request, res: Response<UserResponse>) => {
  try {
    // Gets user ID
    const id = req.body.decoded._id

    if(typeof id === 'string') {
      // Checks if user ID is a valid mongo ID
      if (mongoose.Types.ObjectId.isValid(id)) {
        // Gets user data form DB and removes unnecessary fields
        const user = await model_users.findByIdAndUpdate(id, { isDeleted: true }, {new: true})
        // Is isDeleted changed to true, success
        if(user.isDeleted) {
          return res.status(200).json({
            status: 200,
            message: 'User marked for deletion'
          })
        }
      }
    }
    // If any if statements fails this code runs
    return res.status(403).json({
      status: 403,
      message: 'Not authorized'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

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