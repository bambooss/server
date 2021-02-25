import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'


exports.auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth token: ', req.headers.authorization)
    const bearerTokenSecret: string | undefined = process.env.BEARER_TOKEN_SECRET

    if (!req.headers.authorization) {

      return res.status(401).json({
        status: 401,
        message: 'Missing authentication'
      })
    }

    const token = req.headers.authorization.replace('Bearer ', '')

    if(!bearerTokenSecret) {
      res.status(500).json({
        status: 500,
        message: 'Server error'
      })
    } else {
      const decoded = jwt.verify(token, bearerTokenSecret)

      console.log(decoded)
      if(!decoded) {
        return res.status(401).json({
          status: 401,
          message: 'Missing authentication'
        })
      }
      req.body.decoded = decoded
      next()
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}