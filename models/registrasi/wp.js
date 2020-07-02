const { model, Schema } = require('mongoose')

const dimFlagSchema = new Schema({
  NPWP: { type: String, index: true },
  KPPADM: { type: String, index: true },
  ID_JNS_WP: { type: String, index: true },
  KD_KLU: { type: String, index: true },
  NIP_AR: { type: String, index: true },
}, { strict: false })

module.exports = model('WP', dimFlagSchema, 'WP')