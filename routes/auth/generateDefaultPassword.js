const bcrypt = require('bcrypt')
const PEGAWAI = require('../../models/pegawai')

const generateDefaultPassword = cb => {
  const salt = bcrypt.genSaltSync(10)
  const pegawai = PEGAWAI.find().cursor()
  pegawai.on('data', async chunk => {
    pegawai.pause()
    chunk.PASSWORD = await bcrypt.hash(chunk.NIP9, salt)
    await chunk.save()
    pegawai.resume()
  })
  pegawai.on('close', cb)
}

if(process.argv[2] == 'run'){
  const mongoose = require('mongoose')

  mongoose.connect('mongodb://localhost:27017/infografis', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false
  }, () => {
    generateDefaultPassword(process.exit)
  })
}