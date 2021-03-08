import express from 'express'

const { createProject, getProjectById, getAllProjects, updateProjectById, deleteProjectById } = require('../api/controllers/controller-project')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createProject)
router.get('/', auth, getAllProjects)
router.get('/:id', auth, getProjectById)
router.patch('/:id', auth, updateProjectById)
router.delete('/:id', auth, deleteProjectById)

module.exports = router