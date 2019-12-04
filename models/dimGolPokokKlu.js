const { model, Schema } = require('mongoose')

const dimGolPokokKlu = new Schema({
  KD_GOL_POKOK_KLU: { type: String, required: true, unique: true, index: true },
  NAMA_GOL_POKOK_KLU: { type: String, required: true, index: true },
})

module.exports = model('DIMGOLPOKOKKLU', dimGolPokokKlu, 'DIMGOLPOKOKKLU')