import express from 'express'
const {generateTagsFromArray} = require('../api/controllers/controller-tag')
const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/generate', auth, generateTagsFromArray)

module.exports = router