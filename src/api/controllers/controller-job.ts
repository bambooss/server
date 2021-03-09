import { Request, Response } from 'express'
// import mongoose from 'mongoose'

// const model_users = require('../models/model-user')
const model_projects = require('../models/model-project')
const model_technology = require('../models/model-technology')
const model_job = require('../models/model-job')

exports.createJob = async (req: Request, res: Response) => {
  try {
    const jobDetails = {
      title: req.body.job.title,
      sortTitle: req.body.job.title.toLowerCase(),
      description: req.body.job.description,
      technologies: req.body.job.technologies,
      project: req.body.job.projectId
    }

    const verifiedProject = await model_projects.findOne({
      owner: req.body.decoded._id,
      _id: req.body.job.projectId
    })

    if (!verifiedProject) {
      return res.status(400).json({
        status: 400,
        message: 'No permission to add job to this project'
      })
    }

    const createdJob = await model_job.create(jobDetails)

    if (!createdJob) {
      return res.status(400).json({
        status: 400,
        message: 'Something went wrong, please try again later'
      })
    }

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
    const jobId = req.params.id
    const job = await model_job.findById(jobId).populate('project')
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
