const PEMBAYARAN_MASA = require('../../models/pembayaranMasa')

const pengawasanPembayaranMasa = async (req, res) => {
  const { KPPADM, NIP_AR } = req.query
  const filter = NIP_AR ? { NIP_AR } : KPPADM ? { KPPADM } : {}
  data = await PEMBAYARAN_MASA.find(filter)
  // console.log(data)
  res.json(data)
}

module.exports = pengawasanPembayaranMasa

if(process.argv[2] == 'run'){
  const mongoose = require('mongoose')

  mongoose.connect('mongodb://localhost:27017/infografis', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false
  }, async () => {
    await pengawasanPembayaranMasa({ query: { KPPADM: process.argv[3], NIP_AR: process.argv[4] } })
    process.exit() 
  })
}