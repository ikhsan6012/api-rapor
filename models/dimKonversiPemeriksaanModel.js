const { Schema, model } = require('mongoose')

const dimKonversiPemeriksaanSchema = new Schema({
  KD_PEMERIKSAAN: { type: String, index: true },
  JNS_PEMERIKSAAN: String,
  KEG_PEMERIKSAAN: String,
  URAIAN_PEMERIKSAAN: String,
  JNS_PAJAK_PEMERIKSAAN: String,
  SUBYEK_PAJAK: String,
  PEMERIKSA_PAJAK: { type: String, index: true },
})

module.exports = model('DIM_KONVERSI_PEMERIKSAAN', dimKonversiPemeriksaanSchema, 'DIM_KONVERSI_PEMERIKSAAN')