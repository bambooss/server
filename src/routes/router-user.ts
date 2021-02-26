import express from 'express'

const { createUser, loginUser, getUserProfile } = require('../api/controllers/controller-user')
// const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
// router.post('/forgot', forgotPassword)
router.get('/', getUserProfile)

module.exports = router