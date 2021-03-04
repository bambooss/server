import { Request, Response } from 'express'

exports.generateTechnologiesFromArray = async (req: Request, res: Response) => {
  try {
    res.send('technology')
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}