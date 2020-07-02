const { Schema, model } = require('mongoose')

const wpTltbSchema = new Schema({
  TH_PJK: { type: Number, index: true, required: true },
  NPWP: { type: String, index: true, required: true },
  KPPADM: { type: String, index: true, required: true },
})
module.exports = model('WP_TLTB', wpTltbSchema, 'WP_TLTB')