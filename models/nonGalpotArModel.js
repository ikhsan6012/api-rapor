const { Schema, model } = require('mongoose')

const nonGalpotArSchema = new Schema({
    NIP_AR: { type: String, unique: true, index: true },
    NM_AR: String,
    JML_WP: Number,
    KONSULTASI: Number,
    KORESPONDENSI: Number,
    KUNJUNGAN_AR: Number,
    AKTIVITAS_LAINNYA: Number,
    KD_KPP: { type: String, index: true },
}, { timestamps: true })

module.exports = model('NONGALPOTAR', nonGalpotArSchema, 'NONGALPOTAR')