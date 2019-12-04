const { Schema, model } = require('mongoose')

const sp2dkWpSchema = new Schema({
    NPWP: { type: String, unique: true, index: true },
    NM_WP: String,
    JML_SP2DK: Number,
    JML_SP2DK_BLM_LHP2DK: Number,
    JML_LHP2DK: Number,
    JML_KEP_LHP2DK_SELESAI: Number,
    JML_KEP_LHP2DK__USULRIK: Number,
    JML_KEP_LHP2DK_USULBUKPER: Number,
    JML_KEP_LHP2DK_DLMPENGAWASAN: Number,
    JML_KEP_LHP2DK_TA: Number,
    NILAI_POTENSI_AWAL_BLM_LHP2DK: Number,
    NILAI_POTENSI_AWAL_SDH_LHP2DK: Number,
    NILAI_PERUBAHAN: Number,
    NILAI_POTENSI_AKHIR_LHP2DK: Number,
    NILAI_POTENSI_AKHIR_LHP2DK_SELESAI: Number,
    NILAI_POTENSI_AKHIR_LHP2DK_USULRIK: Number,
    NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER: Number,
    NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN: Number,
    NILAI_POTENSI_AKHIR_LHP2DK_TA: Number,
    NILAI_REALISASI: Number,
    NILAI_SALDO_DLMPENGAWASAN: Number,
    NIP_AR: { type: String, index: true },
    KD_KPP: { type: String, index: true },
}, { timestamps: true })

module.exports = model('SP2DKWP', sp2dkWpSchema, 'SP2DKWP')