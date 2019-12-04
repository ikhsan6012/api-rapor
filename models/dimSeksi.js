const { model, Schema } = require('mongoose')

const dimSeksiSchema = new Schema({
  KD_SEKSI: { type: Number, required: true, unique: true, index: true },
  NAMA_SEKSI: { type: String, required: true, unique: true, index: true }
})

module.exports = model('DIMSEKSI', dimSeksiSchema, 'DIMSEKSI')