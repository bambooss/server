import express from 'express'

const { createProject, getProjectById } = require('../api/controllers/controller-project')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createProject)
router.get('/:id', auth, getProjectById)

module.exports = router