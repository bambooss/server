import { Request, Response } from 'express'
const model_technology = require('../models/model-technology')
const sortedTechArray = require('../../data/technologies-1')

/**
 * Controller to create new technologies from an array of strings,
 * it restricts usage to admin users
 * and will return a 201 created message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded.email - user's email
 * @param {object} res - Response object from express router
 * @method POST
 * @route /technology/generate
 * @access Private
 * @author Gabor
 */
exports.generateTechnologiesFromArray = async (req: Request, res: Response) => {
  try {
    // Email from verified token
    const { email } = req.body.decoded

    // Checks if email is an admin email
    if (email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      // Goes through the array of technology names
      await sortedTechArray.map(async (tech: string) => {
        //makes an object out of them
        const techObj = {
          name: tech,
          status: 1
        }

        // Checks if the technology name exists
        const isExisting = await model_technology.findOne({ name: tech })
        // If technology doesn't exist
        if (!isExisting) {
          // Saves technology
          const savedTechnology = await model_technology.create(techObj)
          // If something goes wrong sends an error message back to the client
          if (!savedTechnology) {
            return res.status(500).json({
              status: 500,
              message: 'Something went wrong with tech creation'
            })
          }
        }
      })

      // Success message
      return res.status(201).json({
        status: 201,
        message: 'New technologies were successfully created'
      })

      // If user is not admin sends a not found response
    } else {
      return res.status(404).json({
        status: 404,
        message: "page doesn't exist"
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
 * Controller to list all technologies saved in the DB,
 * and will return an array of technology objects and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} res - Response object from express router
 * @method GET
 * @route /technology
 * @access Private
 * @author Gabor
 */
exports.listTechnologies = async (req: Request, res: Response) => {
  try {
    // Lists all technologies in the DB and takes the ID and the name
    const technologies = await model_technology.find({}).select(['_id', 'name'])
    let techArray: Object[] = []
    technologies.map((t: { name: String }) => {
      const tempObj = {
        name: t.name,
        label: t.name.toLowerCase()
      }
      techArray.push(tempObj)
    })
    //If there are technologies found
    if (technologies.length > 0) {
      // @ts-ignore
      return res.status(200).json({
        status: 200,
        message: 'Successfully listed technologies',
        technologies: techArray
      })
    }

    // If there were no technologies found
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
 * Controller to update a technology name,
 * it restricts usage to admin users
 * it takes in an email to verify the admin,
 * the old name of the technology and a new name of the technology
 * and will return and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded.email - user's email
 * @param {string} req.body.name - old technology name
 * @param {string} req.body.newName - new technology name
 * @param {object} res - Response object from express router
 * @method PATCH
 * @route /technology/name
 * @access Private
 * @author Gabor
 */
exports.updateTechnologyName = async (req: Request, res: Response) => {
  try {
    // Email from verified token
    const { email } = req.body.decoded
    // Old and new technology names
    const technologyName = req.body.name
    const newTechnologyName = req.body.newName

    // Checks if email is an admin email
    if (email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      // searches for the old technology name and replaces the name with the new one
      const updatedTechnologyName = await model_technology.findOneAndUpdate(
        { name: technologyName },
        { name: newTechnologyName }
      )
      // If success
      if (updatedTechnologyName) {
        return res.status(200).json({
          status: 200,
          message: `${technologyName} was successfully updated to ${newTechnologyName}`
        })
        // If no technology were found with the name
      } else {
        return res.status(400).json({
          status: 400,
          message: `${technologyName} doesn't exist`
        })
      }
      // If email is not admin email
    } else {
      return res.status(404).json({
        status: 404,
        message: "page doesn't exist"
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
 * Controller to delete a technology,
 * it restricts usage to admin users
 * it takes in an email to verify the admin,
 * and a technology name to be removed
 * and will return and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded.email - user's email
 * @param {string} req.body.name - technology name
 * @param {object} res - Response object from express router
 * @method DELETE
 * @route /technology
 * @access Private
 * @author Gabor
 */
exports.deleteOneTechnology = async (req: Request, res: Response) => {
  try {
    // Email from verified token
    const { email } = req.body.decoded
    // Technology name
    const technology = req.body.name

    // Checks if email is an admin email
    if (email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      // Looks for the technology with the name specified and deletes it
      const removedTechnology = await model_technology.findOneAndRemove({
        name: technology
      })

      // If technology found
      if (removedTechnology) {
        return res.status(200).json({
          status: 200,
          message: `${req.body.name} was successfully deleted`
        })
      }
      // If no technology found
      return res.status(400).json({
        status: 400,
        message: 'Something went wrong'
      })
      // If email is not admin email
    } else {
      return res.status(404).json({
        status: 404,
        message: "page doesn't exist"
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
 * Controller to delete all technologies,
 * it restricts usage to admin users
 * and will return and a 200 success message.
 * @param {Request} req - Request object from express router
 * @param {object} req.body.decoded.email - user's email
 * @param {object} res - Response object from express router
 * @method DELETE
 * @route /technology/all
 * @access Private
 * @author Gabor
 */
exports.deleteAllTechnologies = async (req: Request, res: Response) => {
  try {
    // Email from verified token
    const { email } = req.body.decoded

    // Checks if email is an admin email
    if (email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      await model_technology.remove({})

      return res.status(200).json({
        status: 200,
        message: 'All technologies were successfully deleted'
      })
      // If email is not admin email
    } else {
      return res.status(404).json({
        status: 404,
        message: "page doesn't exist"
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
