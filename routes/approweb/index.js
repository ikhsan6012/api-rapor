const express = require('express')
const router = express.Router()

const getDataAndImportSp2dk = require('./sp2dk')
const getDataAndImportStp = require('./stp')
const getDataAndImportNonGalpot = require('./nonGalpot')

router.post('/sp2dk', getDataAndImportSp2dk)
router.post('/stp', getDataAndImportStp)
router.post('/non-galpot', getDataAndImportNonGalpot)

module.exports = router