import express from 'express'
const {
  generateLanguagesFromArray,
  listLanguages
} = require('../api/controllers/controller-language')
const { auth } = require('../middlewares/middleware-auth')
const router = express.Router()

router.post('/generate', auth, generateLanguagesFromArray)
router.get('/', listLanguages)
// router.patch('/name', auth, updateTechnologyName)
// router.delete('/', auth, deleteOneTechnology)
// router.delete('/all', auth, deleteAllTechnologies)

module.exports = router
