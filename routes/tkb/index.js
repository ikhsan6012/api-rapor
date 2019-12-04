const express = require('express')
const router = express.Router()

const getKurs = require('./kurs')

router.post('/kurs', getKurs)

module.exports = router