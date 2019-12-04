const { Schema, model } = require('mongoose')

const stpArSchema = new Schema({
    NIP_AR: { type: String, unique: true, index: true },
    NM_AR: String,
    JML_STP: Number,
    JML_WP: Number,
    NILAI_IDR: Number,
    NILAI_USD: Number,
    KD_KPP: { type: String, index: true },
}, { timestamps: true })

module.exports = model('STPAR', stpArSchema, 'STPAR')