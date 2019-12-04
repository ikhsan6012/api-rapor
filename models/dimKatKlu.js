const { model, Schema } = require('mongoose')

const dimKatKluSchema = new Schema({
  KD_KAT_KLU: { type: String, required: true, unique: true, index: true },
  NAMA_KAT_KLU: { type: String, required: true, index: true },
})

module.exports = model('DIMKATKLU', dimKatKluSchema, 'DIMKATKLU')