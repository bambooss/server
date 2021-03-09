import express from 'express'

const {
  createJob,
  getJobById
} = require('../api/controllers/controller-job')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createJob)
router.get('/:id', auth, getJobById)

module.exports = router