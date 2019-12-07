const { model, Schema } = require('mongoose')

const dimKluSchema = new Schema({
  ID_KLU: { type: Number },
  KD_KLU: { type: String, required: true, index: true },
  NM_KLU: { type: String },
  KET_KLU: { type: String },
  KD_SUBGOL: { type: String, index: true },
  NM_SUBGOL: { type: String },
  KD_GOL: { type: String, index: true },
  NM_GOL: { type: String },
  KD_GOLPOK: { type: String, index: true },
  NM_GOLPOK: { type: String },
  KD_KATEGORI: { type: String, index: true },
  NM_KATEGORI: { type: String },
})

module.exports = model('DIM_KLU', dimKluSchema, 'DIM_KLU')