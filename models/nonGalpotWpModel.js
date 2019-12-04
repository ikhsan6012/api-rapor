const { Schema, model } = require('mongoose')

const nonGalpotWpSchema = new Schema({
    NPWP: { type: String, unique: true, index: true },
    NM_WP: String,
    KONSULTASI: Number,
    KORESPONDENSI: Number,
    KUNJUNGAN_AR: Number,
    AKTIVITAS_LAINNYA: Number,
    KD_KPP: { type: String, index: true },
    NIP_AR: { type: String, index: true },
}, { timestamps: true })

module.exports = model('NONGALPOTWP', nonGalpotWpSchema, 'NONGALPOTWP')