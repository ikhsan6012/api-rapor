const { Schema, model } = require('mongoose')

const stpKwlSchema = new Schema({
    KD_KWL: { type: String, unique: true, index: true },
    NM_KWL: String,
    JML_STP: Number,
    JML_WP: Number,
    NILAI_IDR: Number,
    NILAI_USD: Number,
}, { timestamps: true })

module.exports = model('STPKWL', stpKwlSchema, 'STPKWL')