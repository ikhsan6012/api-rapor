const express = require('express')
const router = express.Router()

const importMfwp = require('./mfwp2')

router.post('/mfwp', importMfwp)

module.exports = router