const { model, Schema } = require('mongoose')

const dimKantorSchema = new Schema({
  KD_KANTOR: { type: String, required: true, unique: true, index: true },
  NM_KANTOR: { type: String, required: true, index: true },
  ALAMAT: String,
  TIPE: { type: String, required: true, default: 'KPP', index: true },
  KD_KANWIL: { type: String, index: true }
}, { timestamps: true })

module.exports = model('DIMKANTOR', dimKantorSchema, 'DIMKANTOR')