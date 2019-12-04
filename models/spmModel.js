const { Schema, model } = require('mongoose')

const spmSchema = new Schema({
    NO_SPM: String,
    NPWP: { type: String, index: true },
    KPP: { type: String, index: true },
    NAMA_WP: String,
    KDMAP: { type: String, index: true },
    KJS: { type: String, index: true },
    MASA_PAJAK: String,
    TGL_BAYAR: Number,
    JUMLAH: Number,
    NTPN: String,
    KD_BANK: String,
    NOSKSSP: String,
    THN_DAFTAR: { type: String, index: true },
    NIP_AR: { type: String, index: true }
})

module.exports = model('SPM', spmSchema, 'SPM')