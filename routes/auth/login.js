const bcrypt = require('bcrypt')
const PEGAWAI = require('../../models/pegawai')

const login = async (req, res) => {
  const { nip, password, path } = req.body
  const pegawai = await PEGAWAI.findOne({ NIP9: nip })
  const is_match = await bcrypt.compare(password, pegawai.PASSWORD)
  if(is_match){
    req.session.user = await bcrypt.hash(pegawai, 10)
    return res.json({
      ok: 1,
      location: path
    })
  }
  return res.json({
    ok: false,
    location: '/login'
  })
}
module.exports = login

if (process.argv[2] == 'run'){
  const mongoose = require('mongoose')

  mongoose.connect('mongodb://localhost:27017/infografis', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false
  }, () => {
    login({ body: { nip: process.argv[3], password: process.argv[4] } })
  })
}