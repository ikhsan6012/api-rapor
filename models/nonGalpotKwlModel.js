const { Schema, model } = require('mongoose')

const nonGalpotKwlSchema = new Schema({
    KD_KWL: { type: String, unique: true, index: true },
    NM_KWL: String,
    KONSULTASI: Number,
    KORESPONDENSI: Number,
    KUNJUNGAN_AR: Number,
    AKTIVITAS_LAINNYA: Number,
}, { timestamps: true })

module.exports = model('NONGALPOTKWL', nonGalpotKwlSchema, 'NONGALPOTKWL')