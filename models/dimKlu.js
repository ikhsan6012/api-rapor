const { model, Schema } = require('mongoose')

const dimKluSchema = new Schema({
  KD_KLU: { type: String, required: true, unique: true, index: true },
  NAMA_KLU: { type: String, required: true, index: true },
})

module.exports = model('DIMKLU', dimKluSchema, 'DIMKLU')