const { model, Schema } = require('mongoose')

const dimWilSchema = new Schema({
  ID_WIL: { type: Number },
  KD_WIL: { type: String, index: true, required: true },
  NM_KELURAHAN: { type: String },
  KD_KECAMATAN: { type: String, index: true },
  NM_KECAMATAN: { type: String },
  KD_DATI2: { type: String, index: true },
  NM_DATI2: { type: String },
  KD_DATI1: { type: String, index: true },
  NM_DATI1: { type: String },
  KPPADM: { type: String, index: true },
  KD_POS: { type: String, index: true },
})

module.exports = model('DIM_WIL', dimWilSchema, 'DIM_WIL')