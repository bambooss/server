import { Request, Response } from 'express'
const model_language = require('../models/model-language')
const { languages } = require('../../data/languages')

exports.generateLanguagesFromArray = async (req: Request, res: Response) => {
  try {
    // Email from verified token
    const { email } = req.body.decoded

    // Checks if email is an admin email
    if (email === 'csecsi85@gmail.com' || email === 'mazbsorz@gmail.com') {
      // Goes through the array of language names
      await languages.map(async (lang: { name: string; code: string }) => {
        // Checks if the language name exists
        const isExisting = await model_language.findOne({ name: lang.name })
        // If language doesn't exist
        if (!isExisting) {
          // Saves language
          const savedLanguage = await model_language.create(lang)
          // If something goes wrong sends an error message back to the client
          if (!savedLanguage) {
            return res.status(500).json({
              status: 500,
              message: 'Something went wrong with language creation'
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
