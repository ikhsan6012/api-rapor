const { model, Schema } = require('mongoose')

const dimPegawai = new Schema({
  DW_SK_PEGAWAI: { type: String },
  NIP9: { type: String, index: true },
  NIP18: { type: String },
  NAMA: { type: String },
  ID_JNS_KELAMIN: { type: Number },
  ID_AGAMA: { type: Number },
  ID_STS_KWN: { type: Number },
  TGL_LHR: { type: String },
  TMP_LHR: { type: String },
  NO_KARPEG: { type: String },
  NPWP: { type: String },
  PENDIDIKAN_FORMAL: { type: String },
  NAMA_UNIT_ES1: { type: String },
  NAMA_UNIT_ES2: { type: String },
  NAMA_UNIT_ES3: { type: String },
  NAMA_UNIT_ES4: { type: String, index: true },
  KD_KANTOR: { type: String, index: true },
  NAMA_KANTOR: { type: String },
  ID_JNS_JABATAN: { type: Number },
  NAMA_JABATAN: { type: String },
  NAMA_PANGKAT: { type: String },
  KPPADM: { type: String },
  KD_UNIT_ORGANISASI: { type: String },
  TMP_LHRKD_JAB_STRUKTURAL: { type: String },
  KD_JAB_FUNGSIONAL: { type: String },
})

module.exports = model('DIM_PEGAWAI', dimPegawai, 'DIM_PEGAWAI')