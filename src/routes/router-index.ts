import express, {Request, Response} from 'express'
const user = require('./router-user')
const project = require('./router-project')
const tag = require('./router-technology')
const router = express.Router()

router
  .use('/user', user)

router
  .use('/project', project)

router
  .use('/technology', tag)

router
  .all('*', (req: Request, res: Response) => {

  res.status(404).json({
    status: 404,
    message: 'page doesn\'t exist',
  })
})

module.exports = router