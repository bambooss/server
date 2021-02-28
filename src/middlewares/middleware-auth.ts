import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'


exports.auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    console.log('Auth token: ', req.headers.authorization)

    const bearerTokenSecret: string | undefined = process.env.BEARER_TOKEN_SECRET

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Authentication error'
      })

    }

    if(!bearerTokenSecret) {
      return res.status(500).json({
        status: 500,
        message: 'Server error'
      })
    } else {
      const decoded = jwt.verify(token, bearerTokenSecret)

      console.log('Decoded: ', decoded)
      if(!decoded) {
        return res.status(401).json({
          status: 401,
          message: 'Authentication error'
        })
      }
      req.body.decoded = decoded
      next()
    }
  } catch (error) {
    console.log(error.name)
    if(error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 401,
        message: 'Authentication error'
      })
    }
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}