import { Request, Response } from 'express'
const model_technology = require('../models/model-technology')
const sortedTechArray = require('../../data/technologies-1')

exports.generateTechnologiesFromArray = async (req: Request, res: Response) => {
  try {
    const {email} = req.body.decoded

    if(email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      sortedTechArray.map(async (tech: string) => {
        const techObj = {
          name: tech,
          status: 1,
        }

        const isExisting = await model_technology.findOne({name: tech})
        if(!isExisting) {
          const savedTechnology = await model_technology.create(techObj)
          if(!savedTechnology) {
            return res.status(500).json({
              status: 500,
              message: 'Something went wrong with tech creation'
            })
          }
        }
      })

      return res.status(201).json({
        status: 201,
        message: 'New technologies were successfully created'
      })

    } else {
      return res.status(404).json({
        status: 404,
        message: 'page doesn\'t exist',
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

exports.listTechnologies = async (req: Request, res: Response) => {
  try {
    const technologies = await model_technology.find({}).select(['_id', 'name'])
    if(technologies.length > 0) {
      return res.status(200).json({
        status: 200,
        message: 'Successfully listed technologies',
        technologies
      })
    }
    res.status(400).json({
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

exports.updateTechnologyName = async (req: Request, res: Response) => {
  try {
    const {email} = req.body.decoded
    const technologyName = req.body.name
    const newTechnologyName = req.body.newName

    if(email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      const updatedTechnologyName = await model_technology.findOneAndUpdate({name: technologyName}, {name: newTechnologyName})
      if(updatedTechnologyName) {
        return res.status(200).json({
          status: 200,
          message: `${technologyName} was successfully updated to ${newTechnologyName}`
        })
      } else {
        return res.status(400).json({
          status: 400,
          message: `${technologyName} doesn't exist`
        })
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: 'page doesn\'t exist',
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

exports.deleteOneTechnology = async (req: Request, res: Response) => {
  try {
    const {email} = req.body.decoded
    const technology = req.body.name

    if(email === 'csecsi85@gmail.com') {
      const removedTechnology = await model_technology.findOneAndRemove({name: technology})

      if(removedTechnology) {
        return res.status(200).json({
          status: 200,
          message: `${req.body.name} was successfully deleted`
        })
      }
      return res.status(400).json({
        status: 400,
        message: 'Something went wrong'
      })
    } else {
      return res.status(404).json({
        status: 404,
        message: 'page doesn\'t exist',
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

exports.deleteAllTechnologies = async (req: Request, res: Response) => {
  try {
    const {email} = req.body.decoded

    if(email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      await model_technology.remove({})

      return res.status(200).json({
        status: 200,
        message: 'All technologies were successfully deleted'
      })
    } else {
      return res.status(404).json({
        status: 404,
        message: 'page doesn\'t exist',
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