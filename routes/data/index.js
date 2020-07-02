const express = require('express')
const router = express.Router()

const getRapor = require('./rapor')
const getPersil = require('./persil')
const sedotAhu = require('./ahu')
const getPenerimaan = require('./penerimaan')
const pengawasanPembayaranMasa = require('./pengawasanPembayaranMasa')

router.get('/rapor', getRapor)
router.get('/persil', getPersil)
router.get('/ahu', sedotAhu)
router.get('/pembayaran-masa', pengawasanPembayaranMasa)
router.post('/penerimaan', getPenerimaan)

module.exports = router