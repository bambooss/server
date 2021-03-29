import { Request, Response } from 'express'
import mongoose from 'mongoose'

const model_projects = require('../models/model-project')
const model_users = require('../models/model-user')
const model_technology = require('../models/model-technology')

/**
 * Controller to create new project,
 * It takes in the new user ID and the project ID
 * and will return the project and a 201 created message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded._id - user's data object
 * @param {object} req.body.project - Project details
 * @param {object} res - Response object from express router
 * @method POST
 * @route /project
 * @access Private
 * @author Gabor
 */
exports.createProject = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
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
    // Assign project creator as owner of the project
    project.owner = user._id
    // Because mongo sort sorts by ascii we need a lowercase version of the name to be able to sort by ABC
    project.sortName = project.name.toLowerCase()

    // Saves project
    const savedProject = await model_projects.create(project)

    // If there was a problem saving the document
    if (!savedProject) {
      return res.status(500).json({
        status: 500,
        message: 'Something went wrong!'
      })
    }

    // Saves projects technologies to the technology model
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

/**
 * Controller to get a project by ID,
 * it needs the project ID to look for the corresponding project
 * and will return the project and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - project ID
 * @param {object} res - Response object from express router
 * @method GET
 * @route /project/:id
 * @access Private
 * @author Gabor
 */
exports.getProjectById = async (req: Request, res: Response) => {
  try {
    // Get project ID
    const projectId = req.params.id
    //Check if there is a project in the DB corresponding to this project ID
    const project = await model_projects.findById(projectId)
    // If no project found
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

/**
 * Controller to get projects with sorting and pagination,
 * it receives the page number, items per page and sort type
 * and will return the projects corresponding to the query and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.query.page - page number
 * @param {string} req.query.itemsPerPage - items to show per page
 * @param {string} req.query.sort - way to sort items
 * @param {object} res - Response object from express router
 * @method GET
 * @route /project
 * @access Private
 * @author Gabor
 */
exports.getAllProjects = async (req: Request<paginationReq>, res: Response) => {
  try {
    let tech
    console.log(req.query)
    if (typeof req.query.technologies === 'string') {
      tech = req.query.technologies.split(',')
    } else {
      const technologies = await model_technology
        .find({})
        .select(['name', '-_id'])
      tech = await technologies.map((technology: { name: String }) => {
        return technology.name
      })
    }
    // const tech = req.query.technologies ? req.query.technologies.split(','): techArray
    const match = req.query.match || 'any'
    let matchObj
    // Page number
    const page = req.query.page || '1'
    // How many items should be per page
    const itemsPerPage = req.query.itemsPerPage || '10000'
    // Type of sorting
    const sort = req.query.sort || '-date'
    // Object to be sent to sort
    let sortObj
    // necessary for mongo skip method
    let itemsToSkip

    let filteredProjects

    let count

    let maxPages

    let jobsAvailable = req.query.job ? { jobsAvailable: req.query.job } : {}

    // Depending of the sort variable value, saves the sort object
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

    switch (match) {
      case 'any':
        matchObj = { $in: tech }
        break
      case 'all':
        matchObj = { $all: tech }
        break
      default:
        matchObj = { $in: tech }
    }

    // Req variables have to be strings
    if (typeof page === 'string' && typeof itemsPerPage === 'string') {
      // Logic for number of documents to be skipped
      itemsToSkip = (parseInt(page, 10) - 1) * parseInt(itemsPerPage, 10)
      // Get the total count of the documents for setting up pages
      tech.pop()
      count = await model_projects.countDocuments({
        technologies: matchObj,
        ...jobsAvailable
      })
      console.log('count: ', count)
      if (count === 0) {
        return res.status(200).json({
          status: 200,
          message: 'No documents found'
        })
      }

      maxPages = Math.ceil(count / parseInt(itemsPerPage, 10))

      if (maxPages < parseInt(page, 10)) {
        return res.status(400).json({
          status: 400,
          message: 'Page number is out of range'
        })
      }
      //The filter function itself
      filteredProjects = await model_projects
        .find({
          technologies: matchObj,
          ...jobsAvailable
        })
        .skip(itemsToSkip)
        .limit(parseInt(itemsPerPage, 10))
        .sort(sortObj)

      // If there are projects matching the filter
      if (filteredProjects.length > 0) {
        return res.status(200).json({
          status: 200,
          message: `Serving page: ${page}, itemsPerPage: ${itemsPerPage}, sorting: ${
            sort || '+name'
          }.`,
          totalProjects: count,
          maxPages: Math.ceil(count / parseInt(itemsPerPage, 10)),
          projects: filteredProjects
        })
      }
    } else {
      // If no results
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

exports.getProjectsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.body.decoded._id
    const projectsByUser = await model_projects
      .find({ owner: userId })
      .select(['-createdAt', '-__v', '-sortName'])
      .sort({ sortName: 1 })

    return res.status(200).json({
      status: 200,
      message: 'Get projects by user ID were successful',
      projects: projectsByUser
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

/**
 * Controller to update a project corresponding to the ID,
 * it also takes the user ID decoded from the token,
 * and check if the user is the owner of the project
 * updates the project and technologies array with new values
 * and will return the project and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - project ID
 * @param {string} req.body.decoded._id - user ID
 * @param {object} req.body.project - project details to be updated
 * @param {string} req.body.project.name - project name
 * @param {string} req.body.project.description - project description
 * @param {array} req.body.project.technologies - technologies array
 * @param {object} res - Response object from express router
 * @method PATCH
 * @route /project/:id
 * @access Private
 * @author Gabor
 */
exports.updateProjectById = async (req: Request, res: Response) => {
  try {
    // ID of the project that comes from the query string
    const projectId = req.params.id
    // The user ID decoded from the token
    const userId = req.body.decoded._id
    // Preparing the project fields to update
    const project = {
      name: req.body.project.name,
      sortName: req.body.project.name.toLowerCase(),
      description: req.body.project.description,
      technologies: req.body.project.technologies,
      projectURL: req.body.project.projectURL
    }
    // Get the project that matches the project ID and the owner is who sent the request
    const validProject = await model_projects.findOne({
      _id: projectId,
      owner: userId
    })

    // If no project is matching the user ID and project ID
    if (!validProject) {
      return res.status(403).json({
        status: 403,
        message: 'You are not authorized to edit this project'
      })
    }
    // Update the project with the new fields
    const updatedProject = await model_projects.findOneAndUpdate(
      { _id: projectId, owner: userId },
      {
        name: project.name,
        sortName: project.sortName,
        description: project.description,
        technologies: project.technologies,
        projectURL: project.projectURL
      },
      { new: true }
    )

    //TODO: Make it more efficient by combining the two if possible

    // Remove the the technologies from the DB
    await model_technology.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    )
    // Reassign the new technologies to the DB
    await model_technology.updateMany(
      { name: project.technologies },
      { $push: { projects: projectId } }
    )
    // If something went wrong with the update
    if (!updatedProject) {
      return res.status(400).json({
        status: 400,
        message: 'Something went wrong'
      })
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully updated project',
      project: updatedProject
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

/**
 * Controller to delete a project by ID,
 * it needs the project ID to look for the corresponding project,
 * the ID decoded from the token to cross check it with the project owner
 * and will return  a 200 deleted message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - project ID
 * @param {string} req.body.decoded._id - user ID from the token
 * @param {object} res - Response object from express router
 * @method DELETE
 * @route /project/:id
 * @access Private
 * @author Gabor
 */
exports.deleteProjectById = async (req: Request, res: Response) => {
  try {
    // Get project ID from the query string
    const projectId = req.params.id
    // Get the user ID from the token
    const userId = req.body.decoded._id

    const deletedProject = await model_projects.findOneAndRemove({
      _id: projectId,
      owner: userId
    })

    // If user ID and project Id are correct
    if (deletedProject) {
      // Remove technologies from the DB
      await model_technology.updateMany(
        { projects: projectId },
        { $pull: { projects: projectId } }
      )

      return res.status(200).json({
        status: 200,
        message: 'Project successfully deleted'
      })
    }
    // If no project found
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

////////////////
// INTERFACES //
////////////////

interface paginationReq {
  query: {
    page: string
    itemsPerPage: string
  }
}
