import express from 'express'

const { createUser, loginUser } = require('../api/controllers/controller-user')
const router = express.Router()

router.post('/user/register', createUser)
router.post('/user/login', loginUser)

module.exports = router