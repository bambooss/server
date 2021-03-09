import express from 'express'

const {
  createJob
} = require('../api/controllers/controller-job')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createJob)

module.exports = router