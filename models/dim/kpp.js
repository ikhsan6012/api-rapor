const { model, Schema } = require('mongoose')

const dimKantorSchema = new Schema({
  KD_KPP: { type: String, index: true, required: true },
  NM_KPP: { type: String },
  JNS_KPP: { type: String },
  KD_KANWIL: { type: String, index: true },
  NM_KANWIL: { type: String },
  KD_SURAT: { type: String },
})

module.exports = model('DIM_KPP', dimKantorSchema, 'DIM_KPP')