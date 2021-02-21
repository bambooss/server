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

    if(user.password !== user.password_confirmation) {
      return res.status(400).json({
        status: 400,
        message: 'Passwords do not match'
      })
    }

    user.password = await bcrypt.hash(user.password, 11)

    user = await model_users.create(user)
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