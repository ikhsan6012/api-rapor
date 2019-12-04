const express = require('express')
const router = express.Router()

const { addKantor } = require('./kantor')
const importAr = require('./ar')
const addSeksi = require('./seksi')
const addKlu = require('./klu')

router.post('/kantor', addKantor)
router.post('/ar', importAr)
router.post('/seksi', addSeksi)
router.post('/klu', addKlu)

module.exports = router