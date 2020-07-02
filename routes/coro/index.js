const express = require('express')
const router = express.Router()

const importInitMPN = require('./importInitMPN')

router.post('/mpn', importInitMPN)

module.exports = router