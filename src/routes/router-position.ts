import express from 'express'

const {
  createPosition,
  getPositionById,
  getPositionsByProject,
  getAllPositions,
  updatePositionById,
  deleteJobById
} = require('../api/controllers/controller-job')

const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createPosition)
router.get('/', auth, getAllPositions)
router.get('/project/:id', auth, getPositionsByProject)
router.get('/:id', auth, getPositionById)
router.patch('/:id', auth, updatePositionById)
// router.delete('/:id', auth, deleteJobById)

module.exports = router
