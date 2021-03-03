import { Request, Response } from 'express'

const model_projects = require('../models/model-project')

exports.createProject = async (req: Request, res: Response) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}