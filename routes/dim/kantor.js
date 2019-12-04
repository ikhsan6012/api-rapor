const DIMKANTOR = require('../../models/dimKantor')

const addKantor =  (req, res) => {
  const data = req.body
  DIMKANTOR.findOneAndUpdate({ KD_KANTOR: data.KD_KANTOR }, data, { upsert: true })
    .then(() => res.json({ ok: true }))
    .catch(err => res.json(err))
}

module.exports = {
  addKantor
}