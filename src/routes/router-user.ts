import express from 'express'

const { createUser, loginUser, getUserProfile, updateUser, deleteUser, logout, logoutAll } = require('../api/controllers/controller-user')
const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
// router.post('/forgot', forgotPassword)
router.get('/', auth, getUserProfile)
router.delete('/', auth, deleteUser)
router.patch('/', auth, updateUser)
router.get('/logout', auth, logout)
router.get('/logout/all', auth, logoutAll)

module.exports = router