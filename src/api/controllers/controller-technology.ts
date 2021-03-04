import { Request, Response } from 'express'
const model_technology = require('../models/model-technology')
const sortedTechArray = require('../../data/technologies-1')

exports.generateTechnologiesFromArray = async (req: Request, res: Response) => {
  try {
    const {email} = req.body.decoded

    if(email === 'csecsi85@gmail.com') {
      sortedTechArray.map(async (tech: string) => {
        const techObj = {
          name: tech,
          status: 1,
        }

        const savedTechnology = await model_technology.create(techObj)
        if(!savedTechnology) {
          return res.status(500).json({
            status: 500,
            message: 'Something went wrong with tech creation'
          })
        }
      })

      return res.status(201).json({
        status: 201,
        message: 'New technologies were successfully created'
      })

    } else {
      res.status(404).json({
        status: 404,
        message: 'page doesn\'t exist',
      })
    }
    res.send('technology')
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}