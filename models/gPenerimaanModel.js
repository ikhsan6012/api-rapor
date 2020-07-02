const { Schema, model } = require('mongoose')

const gPenerimaanSchema = new Schema({
  PID: { type: Number, index: true },
  NAME: String,
  DATA: [Schema.Types.Mixed],
  TGL_UPDATE: Date
})

module.exports = model('G_PENERIMAAN', gPenerimaanSchema, 'G_PENERIMAAN')