const { model, Schema } = require('mongoose')

const dimFlagSchema = new Schema({
  FG: { type: String, required: true, index: true },
  KET: { type: String },
})

module.exports = model('DIM_FLAG', dimFlagSchema, 'DIM_FLAG')