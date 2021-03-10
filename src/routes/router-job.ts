import express from 'express'

const {
  createJob,
  getJobById,
  getAllJobs,
  deleteJobById,
} = require('../api/controllers/controller-job')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createJob)
router.get('/', auth, getAllJobs)
router.get('/:id', auth, getJobById)
router.delete('/:id', auth, deleteJobById)

module.exports = router