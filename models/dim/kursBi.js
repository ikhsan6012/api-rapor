const { model, Schema } = require('mongoose')

const dimFlagSchema = new Schema({
  CURR: { type: String, index: true },
  TGL_KURS: { type: String, index: true },
  JML_KURS_JUAL: { type: Number },
  JML_KURS_BELI: { type: Number },
  JML_KURS_TENGAH: { type: Number },
})

module.exports = model('DIM_KURS_BI', dimFlagSchema, 'DIM_KURS_BI')