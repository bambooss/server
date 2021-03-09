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
      message: 'Job added successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}
