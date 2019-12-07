const { model, Schema } = require('mongoose')

const dimKantorSchema = new Schema({
  KD_KANTOR: { type: String, index: true },
  ID_JNS_KANTOR: { type: Number },
  NM_JNS_KANTOR: { type: String },
  TP_KANTOR: { type: String },
  NM_KANTOR: { type: String },
  KD_KPP: { type: String, index: true },
  KD_KANWIL: { type: String, index: true },
  ALAMAT: { type: String },
  KOTA: { type: String },
  KD_POS: { type: String },
  TELP: { type: String },
  FAX: { type: String },
})

module.exports = model('DIM_KANTOR', dimKantorSchema, 'DIM_KANTOR')