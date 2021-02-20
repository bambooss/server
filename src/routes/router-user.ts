import express from 'express'

const { createUser } = require('../api/controllers/controller-user')
const router = express.Router()

router.post('/user', createUser)

module.exports = router