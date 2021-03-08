import { Request, Response } from 'express'
import mongoose from 'mongoose'

const model_projects = require('../models/model-project')
const model_users = require('../models/model-user')
const model_technology = require('../models/model-technology')

exports.createProject = async (req: Request, res: Response) => {
  try {
    // Gets user ID
    const id = req.body.decoded._id
    // Gets project details from front-end
    const { project } = req.body
    let user

    // Checks if user ID is a string
    if (typeof id === 'string') {
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
    project.sortName = project.name.toLowerCase()

    const savedProject = await model_projects.create(project)

    if (!savedProject) {
      return res.status(500).json({
        status: 500,
        message: 'Something went wrong!'
      })
    }

    await model_technology.updateMany(
      { name: savedProject.technologies },
      { $push: { projects: savedProject._id } }
    )

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

exports.getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id

    const project = await model_projects.findById(projectId)

    if (!project) {
      return res.status(404).json({
        status: 404,
        message: 'Project not found'
      })
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully retrieved project',
      project
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

exports.getAllProjects = async (req: Request<paginationReq>, res: Response) => {
  try {
    const page = req.query.page || '1'
    const itemsPerPage = req.query.itemsPerPage || '10000'
    const sort = req.query.sort || '+name'
    let sortObj
    let itemsToSkip

    switch (sort) {
      case '+name':
        sortObj = { sortName: 1 }
        break
      case '-name':
        sortObj = { sortName: -1 }
        break
      case '+date':
        sortObj = { createdAt: 1 }
        break
      case '-date':
        sortObj = { createdAt: -1 }
        break
      default:
        sortObj = { sortName: 1 }
    }

    if (typeof page === 'string' && typeof itemsPerPage === 'string') {
      itemsToSkip = (parseInt(page, 10) - 1) * parseInt(itemsPerPage, 10)
      const filteredProjects = await model_projects
        .find({})
        .skip(itemsToSkip)
        .limit(parseInt(itemsPerPage, 10))
        .sort(sortObj)
      if (filteredProjects.length > 0) {
        return res.status(200).json({
          status: 200,
          message: `Serving page: ${page}, itemsPerPage: ${itemsPerPage}, sorting: ${sort || '+name'}.`,
          projects: filteredProjects
        })
      }
    } else {
      return res.status(400).json({
        status: 400,
        message: 'Invalid type of input'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

exports.updateProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const userId = req.body.decoded._id

    
    res.send('updateUserById')
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

exports.deleteProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id

    const deletedProject = await model_projects.findByIdAndRemove(projectId)

    if (deletedProject) {
      await model_technology.updateMany(
        { projects: projectId },
        { $pull: { projects: projectId } }
      )

      return res.status(200).json({
        status: 200,
        message: 'Project successfully deleted'
      })
    }

    return res.status(400).json({
      status: 400,
      message: 'Project not found'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

interface paginationReq {
  query: {
    page: string
    itemsPerPage: string
  }
}
