const { Schema, model } = require('mongoose')

const mpnSchema = new Schema({
    NPWP: { type: String, index: true },
    NAMA: String,
    ALAMAT: String,
    KDMAP: { type: String, index: true },
    KJS: { type: String, index: true },
    PTNTP: String,
    PTMSPJ: String,
    THNBYR: { type: String, index: true },
    BLNBYR: { type: String, index: true },
    TGLBYR: String,
    JUMLAH: Number,
    BANK: String,
    NOSKSSP: String,
    ID: String,
    NOP: String,
    KPP_PENERIMA: { type: String, index: true },
    KET: String,
    KD_BANK: String,
    PEMBUAT_BILLING: String,
    THN_DAFTAR: { type: String, index: true },
    NIP_AR: { type: String, index: true }
})

module.exports = model('MPN', mpnSchema, 'MPN')