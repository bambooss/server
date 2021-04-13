import express from 'express'

const {
  createPosition,
  getPositionById,
  getJobsByProject,
  getAllJobs,
  updateJobById,
  deleteJobById
} = require('../api/controllers/controller-job')

const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createPosition)
// router.get('/', auth, getAllJobs)
// router.get('/project/:id', auth, getJobsByProject)
router.get('/:id', auth, getPositionById)
// router.patch('/:id', auth, updateJobById)
// router.delete('/:id', auth, deleteJobById)

module.exports = router
