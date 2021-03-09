import express, {Request, Response} from 'express'
const user = require('./router-user')
const project = require('./router-project')
const technology = require('./router-technology')
const job = require('./router-job')
const router = express.Router()

router
  .use('/user', user)

router
  .use('/project', project)

router
  .use('/technology', technology)

router
  .use('/job', job)

router
  .all('*', (req: Request, res: Response) => {

  res.status(404).json({
    status: 404,
    message: 'page doesn\'t exist',
  })
})

module.exports = router