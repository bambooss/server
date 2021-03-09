import { Request, Response } from 'express'
// import mongoose from 'mongoose'

// const model_users = require('../models/model-user')
// const model_projects = require('../models/model-project')
// const model_technology = require('../models/model-technology')
// const model_job = require('../models/model-job')

exports.createJob = async (req: Request, res: Response) => {
  try {
    res.send('it works')
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}