import express, {Request, Response} from 'express'
const user = require('./router-user')
const router = express.Router()

router
  .use('/auth', user)

router
  .all('*', (req: Request, res: Response) => {

  res.status(404).json({
    status: 404,
    message: 'page doesn\'t exist',
  })
})

module.exports = router