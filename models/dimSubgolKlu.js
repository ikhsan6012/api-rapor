const { model, Schema } = require('mongoose')

const dimSubgolKlu = new Schema({
  KD_SUBGOL_KLU: { type: String, required: true, unique: true, index: true },
  NAMA_SUBGOL_KLU: { type: String, required: true, index: true },
})

module.exports = model('DIMSUBGOLKLU', dimSubgolKlu, 'DIMSUBGOLKLU')