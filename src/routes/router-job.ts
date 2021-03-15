import express from 'express'

const {
  createJob,
  getJobById,
  getJobsByProject,
  getAllJobs,
  updateJobById,
  deleteJobById
} = require('../api/controllers/controller-job')

const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createJob)
router.get('/', auth, getAllJobs)
router.get('/project/:id', auth, getJobsByProject)
router.get('/:id', auth, getJobById)
router.patch('/:id', auth, updateJobById)
router.delete('/:id', auth, deleteJobById)

module.exports = router
