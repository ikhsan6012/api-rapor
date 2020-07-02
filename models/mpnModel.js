const { Schema, model } = require('mongoose')

const mpnSchema = new Schema({
	DW_SK: Number,
	ID_SBR_DATA: { type: Number, index: true },
	NPWP_PENYETOR: { type: String, index: true },
	NAMA_PENYETOR: String,
	ALAMAT_PENYETOR: String,
	KPPADM_SETOR: { type: String, index: true },
	KPPADM: String,
	KD_MAP: String,
	KD_SETOR: String,
	MASA_PJK: String,
	NO_SK: String,
	KD_BANK: String,
	KD_CAB_BANK: String,
	TGL_SETOR: { type: Date, index: true },
	NTPN: String,
	JML_SETOR: Number,
	ID_MS_TH_PJK_1: Number,
	ID_MS_TH_PJK_2: Number,
	ID_BILLING: Number,
	ID_MAP_KJS: Number,
	NPWP_PEMBUAT_BILLING: String,
	KPPADM_PEMBUAT_BILLING: String,
	NOP: String,
	NO_SPM: String,
})

module.exports = model('MPN', mpnSchema, 'MPN')