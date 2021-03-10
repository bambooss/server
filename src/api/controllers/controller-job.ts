import { Request, Response } from 'express'
// import mongoose from 'mongoose'

// const model_users = require('../models/model-user')
const model_projects = require('../models/model-project')
const model_technology = require('../models/model-technology')
const model_job = require('../models/model-job')

/**
 * Controller to create a new job,
 * It takes in the new user ID and the job details including the project ID
 * and will return the job and a 201 created message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded._id - user's data object
 * @param {object} req.body.job - Job details
 * @param {object} res - Response object from express router
 * @method POST
 * @route /job
 * @access Private
 * @author Gabor
 */
exports.createJob = async (req: Request, res: Response) => {
  try {
    // Prepare job details
    const jobDetails = {
      title: req.body.job.title,
      sortTitle: req.body.job.title.toLowerCase(),
      description: req.body.job.description,
      technologies: req.body.job.technologies,
      project: req.body.job.projectId
    }

    // Check if user is the actual owner of the project
    const verifiedProject = await model_projects.findOne({
      owner: req.body.decoded._id,
      _id: req.body.job.projectId
    })

    // If not verified
    if (!verifiedProject) {
      return res.status(400).json({
        status: 400,
        message: 'No permission to add job to this project'
      })
    }

    // Creat job
    const createdJob = await model_job.create(jobDetails)

    //If there was a problem
    if (!createdJob) {
      return res.status(400).json({
        status: 400,
        message: 'Something went wrong, please try again later'
      })
    }

    // Add job ID to corresponding technology
    await model_technology.updateMany(
      { name: createdJob.technologies },
      { $push: { jobs: createdJob._id } }
    )

    return res.status(201).json({
      status: 201,
      message: 'Job added successfully',
      job: createdJob
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
 * Controller to get a job by ID,
 * it needs the job ID to look for the corresponding job
 * and will return the project and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - job ID
 * @param {object} res - Response object from express router
 * @method GET
 * @route /job/:id
 * @access Private
 * @author Gabor
 */
exports.getJobById = async (req: Request, res: Response) => {
  try {
    // Get job Id
    const jobId = req.params.id
    // Find job by ID and populate the project
    const job = await model_job.findById(jobId).populate('project')
    // If there was no project was found with this ID
    if (!job) {
      return res.status(404).json({
        status: 404,
        message: 'Job not found'
      })
    }

    return res.status(200).json({
      status: 200,
      message: 'Job found',
      job
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
 * Controller to get job with sorting and pagination,
 * it receives the page number, items per page and sort type
 * and will return the jobs corresponding to the query and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.query.page - page number
 * @param {string} req.query.itemsPerPage - items to show per page
 * @param {string} req.query.sort - way to sort items
 * @param {object} res - Response object from express router
 * @method GET
 * @route /job
 * @access Private
 * @author Gabor
 */
exports.getAllJobs = async (req: Request, res: Response) => {
  try {
    // Page number
    const page = req.query.page || '1'
    // How many items should be per page
    const itemsPerPage = req.query.itemsPerPage || '10000'
    // Type of sorting
    const sort = req.query.sort || '+name'
    // Object to be sent to sort
    let sortObj
    // necessary for mongo skip method
    let itemsToSkip

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

    // Req variables have to be strings
    if (typeof page === 'string' && typeof itemsPerPage === 'string') {
      // Logic for number of documents to be skipped
      itemsToSkip = (parseInt(page, 10) - 1) * parseInt(itemsPerPage, 10)
      // Get the total count of the documents for setting up pages
      const count = await model_job.find({}).count()

      const maxPages = Math.ceil(count / parseInt(itemsPerPage, 10))
      
      if(maxPages < parseInt(page, 10)){
        return res.status(400).json({
          status: 400,
          message: 'Page number is out of range'
        })
      }
      // The filter function itself
      const filteredJobs = await model_job
        .find({})
        .skip(itemsToSkip)
        .limit(parseInt(itemsPerPage, 10))
        .sort(sortObj)
      // If there are jobs matching the filter
      if (filteredJobs.length > 0) {
        return res.status(200).json({
          status: 200,
          message: `Serving page: ${page}, itemsPerPage: ${itemsPerPage}, sorting: ${
            sort || '+name'
          }.`,
          totalJobs: count,
          maxPages: Math.ceil(count / parseInt(itemsPerPage, 10)),
          jobs: filteredJobs
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

/**
 * Controller to update a job corresponding to the ID,
 * it also takes the user ID decoded from the token,
 * and check if the user is the owner of the project
 * updates the job and technologies array with new values
 * and will return the job and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - job ID
 * @param {string} req.body.decoded._id - user ID
 * @param {object} req.body.job - job details to be updated
 * @param {string} req.body.job.title - job title
 * @param {string} req.body.job.description - job description
 * @param {array} req.body.job.technologies - technologies array
 * @param {object} res - Response object from express router
 * @method PATCH
 * @route /job/:id
 * @access Private
 * @author Gabor
 */
exports.updateJobById = async (req: Request, res: Response) => {
  try {
    // Get job ID
    const jobId = req.params.id
    // Get user ID from token
    const userId = req.body.decoded._id
    // Prepare job for update
    const job = {
      title: req.body.job.title,
      sortTitle: req.body.job.title.toLowerCase(),
      description: req.body.job.description,
      technologies: req.body.job.technologies,
    }

    // Get job by ID with project populated
    const foundJob = await model_job.findOne({_id: jobId}).populate('project')

    // If job found
    if (foundJob) {
      // If the user is the owner who is making the request
      if(foundJob.project.owner == userId) {
        // Update job
        const updatedJob = await model_job.findOneAndUpdate(
          {_id: jobId},
          {
            title: job.title,
            sortTitle: job.sortTitle,
            description: job.description,
            technologies: job.technologies,
          },
          {new: true}
        )
        // Delete technologies
        await model_technology.updateMany(
          { jobs: jobId },
          { $pull: { jobs: jobId } }
        )
        // Reassign the new technologies to the DB
        await model_technology.updateMany(
          { name: job.technologies },
          { $push: { jobs: jobId } }
        )
        // If update was successful
        if (updatedJob) {
          return res.status(200).json({
            status: 200,
            message: 'Successfully updated job',
            job: updatedJob
          })
        }
      }
    }

    // If something went wrong
    return res.status(400).json({
      status: 400,
      message: 'Something went wrong'
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
 * Controller to delete a job by ID,
 * it needs the job ID to look for the corresponding job,
 * the ID decoded from the token to cross check it with the project owner
 * and will return  a 200 deleted message.
 * @param {Request} req - Request object from express router
 * @param {string} req.params.id - job ID
 * @param {string} req.body.decoded._id - user ID from the token
 * @param {object} res - Response object from express router
 * @method DELETE
 * @route /job/:id
 * @access Private
 * @author Gabor
 */
exports.deleteJobById = async (req: Request, res: Response) => {
  try {
    // Get job ID from the query string
    const jobId = req.params.id
    // Get the user ID from the token
    const userId = req.body.decoded._id

    // Find job by id and populate project
    const job = await model_job.findOne({_id: jobId}).populate('project')

    // If a job found
    if(job) {
      // Verify if the user is the project owner
      if(job.project.owner == userId) {
        // Delete job from DB
        const deletedJob = await model_job.findOneAndRemove({_id: jobId})
        // If job deleted
        if (deletedJob) {
          // Remove job ID from technologies
          await model_technology.updateMany(
              { jobs: jobId },
              { $pull: { jobs: jobId } }
            )

            return res.status(200).json({
              status: 200,
              message: 'Job successfully deleted'
            })
        }
      }
    }

    // If no job found
    return res.status(400).json({
      status: 400,
      message: 'Job not found'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}