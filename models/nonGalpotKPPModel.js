const { Schema, model } = require('mongoose')

const nonGalpotKppSchema = new Schema({
    KD_KPP: { type: String, unique: true, index: true },
    NM_KPP: String,
    KONSULTASI: Number,
    KORESPONDENSI: Number,
    KUNJUNGAN_AR: Number,
    AKTIVITAS_LAINNYA: Number,
    KD_KWL: { type: String, index: true },
}, { timestamps: true })

module.exports = model('NONGALPOTKPP', nonGalpotKppSchema, 'NONGALPOTKPP')