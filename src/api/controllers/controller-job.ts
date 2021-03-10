import { Request, Response } from 'express'
// import mongoose from 'mongoose'

// const model_users = require('../models/model-user')
const model_projects = require('../models/model-project')
const model_technology = require('../models/model-technology')
const model_job = require('../models/model-job')

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

exports.updateJobById = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id
    const userId = req.body.decoded._id
    const job = {
      title: req.body.job.title,
      sortTitle: req.body.job.title.toLowerCase(),
      description: req.body.job.description,
      technologies: req.body.job.technologies,
    }

    const foundJob = await model_job.findOne({_id: jobId}).populate('project')

    if (foundJob) {
      console.log(foundJob.project.owner)
      console.log(userId)
      if(foundJob.project.owner == userId) {
        console.log('this runs')
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
        await model_technology.updateMany(
          { jobs: jobId },
          { $pull: { jobs: jobId } }
        )
        // Reassign the new technologies to the DB
        await model_technology.updateMany(
          { name: job.technologies },
          { $push: { jobs: jobId } }
        )

        console.log(updatedJob)
        if (updatedJob) {
          return res.status(200).json({
            status: 200,
            message: 'Successfully updated job',
            job: updatedJob
          })
        }
      }
    }

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
