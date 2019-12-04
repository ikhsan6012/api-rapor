const { model, Schema } = require('mongoose')

const tltbSchema = new Schema({
  NPWP: { type: String, index: true, required: true, unique: true },
}, { timestamps: true })

module.exports = model('TLTB', tltbSchema, 'TLTB')