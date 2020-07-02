const express = require('express')
const router = express.Router()

const getDataAndImportPenerimaan = require('./penerimaan')
const getDataAndImportMpn = require('./mpn')
const getRincianBarang = require('./rincianBarang')

router.post('/penerimaan', getDataAndImportPenerimaan)
router.post('/mpn', getDataAndImportMpn)
router.get('/rincian-barang/:tahun/:npwp', getRincianBarang)

module.exports = router