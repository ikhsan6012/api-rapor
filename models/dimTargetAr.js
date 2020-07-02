const { model, Schema } = require('mongoose')

const dimTargetArSchema = new Schema({
  TAHUN: { type: Number, required: true, index: true },
  KPPADM: { type: String, required: true, index: true },
  NIP_AR: { type: String, index: true },
  TARGET: { type: Number },
  NAMA_AR: { type: String },
}, { timestamps: true })

module.exports = model('DIM_TARGET_AR', dimTargetArSchema, 'DIM_TARGET_AR')