import express from 'express'
const {generateTechnologiesFromArray, deleteAllTechnologies} = require('../api/controllers/controller-technology')
const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/generate', auth, generateTechnologiesFromArray)
router.delete('/all', auth, deleteAllTechnologies)

module.exports = router