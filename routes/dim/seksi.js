const DIMSEKSI = require('../../models/dimSeksi')

const addSeksi = async (req, res) => {
  const data = req.body
  await DIMSEKSI.findOneAndUpdate({ KD_SEKSI: data.KD_SEKSI }, data, { upsert: true })
  res.json({ ok: true, data })
}

module.exports = addSeksi