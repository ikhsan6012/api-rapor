const { Schema, model } = require('mongoose')

const dimKantorSchema = new Schema({
  KD_KANTOR: String,
  ID_JNS_KANTOR: Number,
  NM_JNS_KANTOR: String,
  TP_JNS_KANTOR: String,
  NM_KANTOR: String,
  KD_KPP: { type: String, index: true },
  KD_KANWIL: { type: String, index: true },
  ALAMAT: String,
  KOTA: String,
  KD_POS: String,
  TELP: String,
  FAX: String,
}, { strict: false })

module.exports = model('DIM_KANTOR', dimKantorSchema, 'DIM_KANTOR')