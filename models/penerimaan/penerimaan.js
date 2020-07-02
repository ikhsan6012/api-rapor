const { model, Schema } = require('mongoose')

const penerimaanSchema = new Schema({}, { strict: false })

module.exports = model('PENERIMAAN', penerimaanSchema, 'PENERIMAAN')