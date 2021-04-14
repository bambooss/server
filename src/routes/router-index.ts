import express, { Request, Response } from 'express'
const user = require('./router-user')
const project = require('./router-project')
const technology = require('./router-technology')
const position = require('./router-position')
const language = require('./router-language')
const router = express.Router()

router.use('/user', user)

router.use('/project', project)

router.use('/technology', technology)

router.use('/position', position)

router.use('/language', language)

router.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: "page doesn't exist"
  })
})

module.exports = router
