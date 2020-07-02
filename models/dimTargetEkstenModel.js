const { Schema, model } = require('mongoose')

const dimTargetEkstenSchema = new Schema({
  KD_KPP: { type: String, index: true },
  TARGET: Number,
}, { strict: false })

module.exports = model('DIM_TARGET_EKSTEN', dimTargetEkstenSchema, 'DIM_TARGET_EKSTEN')