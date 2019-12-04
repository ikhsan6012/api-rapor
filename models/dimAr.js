const { model, Schema } = require('mongoose')

const dimArSchema = new Schema({
  NIP_AR: { type: String, required: true, unique: true, index: true },
  NAMA_AR: { type: String, required: true, index: true },
  KD_SEKSI: { type: Number, required: true, index: true },
  KD_KPP: { type: String, required: true, index: true }
})

module.exports = model('DIMAR', dimArSchema, 'DIMAR')