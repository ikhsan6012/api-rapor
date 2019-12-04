const express = require('express')
const router = express.Router()

const getDataAndImportPenerimaan = require('./penerimaan')
const getDataAndImportMpn = require('./mpn')

router.post('/penerimaan', getDataAndImportPenerimaan)
router.post('/mpn', getDataAndImportMpn)

module.exports = router