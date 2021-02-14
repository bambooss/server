import express = require('express')
const router = express.Router()

router.get('/test', (req, res) => {
  res.send('test is working')
})

router.all('*', (req: express.Request, res: express.Response) => {

  res.status(404).json({
    status: 404,
    message: 'page doesn\'t exist',
  })
})

module.exports = router