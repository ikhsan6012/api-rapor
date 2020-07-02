const { Schema, model } = require('mongoose')

const pegawaiSchema = new Schema({
  DW_SK_PEGAWAI: Number,
  NIP9: { type: String, index: true },
  NIP18: String,
  NAMA: String,
  ID_JNS_KELAMIN: Number,
  ID_AGAMA: Number,
  ID_STS_KWN: Number,
  TGL_LHR: Date,
  TMP_LHR: String,
  NO_KARPEG: String,
  NPWP: String,
  PENDIDIKAN_FORMAL: String,
  NAMA_UNIT_ES1: String,
  NAMA_UNIT_ES2: String,
  NAMA_UNIT_ES3: String,
  NAMA_UNIT_ES4: String,
  KD_KANTOR: String,
  NM_KANTOR: String,
  ID_JNS_JABATAN: Number,
  NAMA_JABATAN: String,
  NAMA_PANGKAT: String,
  KPPADM: { type: String, index: true },
  KD_UNIT_ORGANISASI: String,
  KD_JAB_STRUKTURAL: String,
  KD_JAB_FUNGSIONAL: String,
  ADMINISTRATOR_SISTEM: String,
  PASSWORD: String,
  AUTH_LOGS: [{ type: Schema.Types.ObjectId, ref: 'AUTH_LOG' }]
})

module.exports = model('PEGAWAI', pegawaiSchema, 'PEGAWAI')