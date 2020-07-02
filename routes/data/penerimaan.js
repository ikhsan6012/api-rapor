const G_PENERIMAAN = require('../../models/gPenerimaanModel')

const getPenerimaan = async (req, res) => {
  try{
    const PID = parseInt(req.body.PID)
    const penerimaan = await G_PENERIMAAN.findOne({ PID }, 'DATA TGL_UPDATE')
    res.json({ ok: true, data: penerimaan })
  } catch(err) {
    console.log(err)
    res.json({ ok: false })
  }
}
module.exports = getPenerimaan