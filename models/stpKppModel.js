const { Schema, model } = require('mongoose')

const stpKppSchema = new Schema({
    KD_KPP: { type: String, unique: true, index: true },
    NM_KPP: String,
    JML_STP: Number,
    JML_WP: Number,
    NILAI_IDR: Number,
    NILAI_USD: Number,
    KD_KWL: { type: String, index: true },
}, { timestamps: true })

module.exports = model('STPKPP', stpKppSchema, 'STPKPP')