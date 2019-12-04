const { Schema, model } = require('mongoose')

const pbkSchema = new Schema({
    NPWP: { type: String, index: true },
    NAMA_WP: String,
    KPP: { type: String, index: true },
    KDMAP: { type: String, index: true },
    KJS: { type: String, index: true },
    NOMOR_PBK: String,
    TAHUN:  { type: String, index: true },
    TGL_DOKUMEN:  String,
    TGL_BERLAKU:  String,
    JUMLAH:  Number,
    CURRENCY:  String,
    TIPE_PBK: { type: String, index: true },
    MASA_PAJAK: String,
    TAHUN_PAJAK: String,
    NO_PROD_HUKUM: String,
    NTPN: String,
    THN_DAFTAR: { type: String, index: true },
    NIP_AR: { type: String, index: true }
})

module.exports = model('PBK', pbkSchema, 'PBK')