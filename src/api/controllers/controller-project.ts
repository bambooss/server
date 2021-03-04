import { Request, Response } from 'express'
import mongoose from 'mongoose'

const model_projects = require('../models/model-project')
const model_users = require('../models/model-user')

exports.createProject = async (req: Request, res: Response) => {
  try {
    // Gets user ID
    const id = req.body.decoded._id
    // Gets project details from front-end
    const {project} = req.body
    let user

    // Checks if user ID is a string
    if(typeof id === 'string') {
      // Checks if user ID is a valid mongo ID
      if (mongoose.Types.ObjectId.isValid(id)) {
        // Gets user data form DB
        user = await model_users.findById(id)
        // If user found returns the user
        if (!user) {
          return res.status(403).json({
            status: 403,
            message: 'Not authorized'
          })
        }
      }
    }

    project.owner = user._id

    const savedProject = await model_projects.create(project)

    if(!savedProject) {
      return res.status(500).json({
        status: 500,
        message: 'Something went wrong!',
      })
    }

    return res.status(201).json({
      status: 201,
      message: 'Project was created successfully',
      project: savedProject
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}