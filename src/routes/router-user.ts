import express from 'express'

const { createUser, loginUser, testController } = require('../api/controllers/controller-user')
// const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
// router.post('/forgot', forgotPassword)
router.get('/cookie', testController)

module.exports = router