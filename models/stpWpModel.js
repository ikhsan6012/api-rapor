const { Schema, model } = require('mongoose')

const stpWpSchema = new Schema({
    NPWP: { type: String, unique: true, index: true },
    NM_WP: String,
    JML_STP: Number,
    NILAI_IDR: Number,
    NILAI_USD: Number,
    NIP_AR: { type: String, index: true },
    KD_KPP: { type: String, index: true },
}, { timestamps: true })

module.exports = model('STPWP', stpWpSchema, 'STPWP')