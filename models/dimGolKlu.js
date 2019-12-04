const { model, Schema } = require('mongoose')

const dimGolKlu = new Schema({
  KD_GOL_KLU: { type: String, required: true, unique: true, index: true },
  NAMA_GOL_KLU: { type: String, required: true, index: true },
})

module.exports = model('DIMGOLKLU', dimGolKlu, 'DIMGOLKLU')