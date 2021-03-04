import express from 'express'
const {generateTechnologiesFromArray} = require('../api/controllers/controller-technology')
const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/generate', auth, generateTechnologiesFromArray)

module.exports = router