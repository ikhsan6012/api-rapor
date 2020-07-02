const { Schema, model } = require('mongoose')

const authLogSchema = new Schema({
  PEGAWAI: { type: Schema.Types.ObjectId, ref: 'PEGAWAI', required: true, index: true },
  START: { type: Date },
  EXPIRED: { type: Date },
  SUCCESS: { type: Boolean },
})

module.exports = model('AUTH_LOG', authLogSchema, 'AUTH_LOG')