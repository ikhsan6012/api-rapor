const express = require('express')
const router = express.Router()

const getRapor = require('./rapor')

router.post('/rapor', getRapor)

module.exports = router