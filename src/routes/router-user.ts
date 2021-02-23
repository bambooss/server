import express from 'express'

const { createUser, loginUser, forgotPassword } = require('../api/controllers/controller-user')
const router = express.Router()

router.post('/user/register', createUser)
router.post('/user/login', loginUser)
router.post('/user/forgot', forgotPassword)

module.exports = router