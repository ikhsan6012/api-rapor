const { model, Schema } = require('mongoose')

const kursSchema = new Schema({
  KMK: String,
  KURS: Schema.Types.Mixed,
  TGL_BERLAKU: { type: Date, index: true, unique: true }
}, { timestamps: true })

module.exports = model('KURS', kursSchema, 'KURS')