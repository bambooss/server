import { Request, Response } from 'express'

exports.generateTagsFromArray = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}