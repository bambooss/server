import express from 'express'

const { createProject } = require('../api/controllers/controller-project')
const { auth } = require('../middlewares/middleware-auth')

const router = express.Router()

router.post('/', auth, createProject)

module.exports = router