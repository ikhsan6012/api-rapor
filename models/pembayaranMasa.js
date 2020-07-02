const { Schema, model } = require('mongoose')

const pembayaranMasaSchema = new Schema({
  NPWP: { type: String, index: true },
  PILIH: { type: Number },
  PASAL: { type: Number },
  TAHUN: { type: Number },
  JENIS: { type: Number },
  ANGSURAN_SPT_2017: { type: Number },
  ANGSURAN_SPT_2018: { type: Number },
  JAN: { type: Number },
  JAN: { type: Number },
  FEB: { type: Number },
  MAR: { type: Number },
  APR: { type: Number },
  MEI: { type: Number },
  JUN: { type: Number },
  JUL: { type: Number },
  AGU: { type: Number },
  SEP: { type: Number },
  OKT: { type: Number },
  NOV: { type: Number },
  DES: { type: Number },
  TOTAL: { type: Number },
  KPPADM: { type: String, index: true },
  NIP_AR: { type: String, index: true },
}, { strict: false })

module.exports = model('PEMBAYARAN_MASA', pembayaranMasaSchema, 'PEMBAYARAN_MASA')