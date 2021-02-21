import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
const model_users = require('../models/model-user')

exports.createUser = async (req: express.Request, res: express.Response) => {
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
    if(user.password !== user.password_confirmation) {
      return res.status(400).json({
        status: 400,
        message: 'Passwords do not match'
      })
    }

    // Hash password
    user.password = await bcrypt.hash(user.password, 11)

    // Verify and create social profiles
    user = verifyAndCreateSocial(user)

    // Create user model
    user = await model_users.create(user)
    // Generate auth token
    const token = await user.generateAuthToken()

    return res.status(200).json({
      status: 200,
      message: 'User was created successfully',
      token: token
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: 'Server error 500'
    })
  }
}

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