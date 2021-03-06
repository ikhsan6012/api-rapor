const MPN = require('../../models/mpnModel')
const DIM_KANTOR = require('../../models/dimKantorModel')
const DIM_TARGET_EKSTEN = require('../../models/dimTargetEkstenModel')
const G_PENERIMAAN = require('../../models/gPenerimaanModel')

const pivotData = async data => {
  let rows = []
  let columns = []
  
  for(let d of data){
    rows.push(d._id.KPPADM)
    columns.push(d._id[Object.keys(d._id)[1]])
  }
  rows = [...new Set([...rows])].sort()
  columns = [...new Set([...columns])].sort()

  const data2 = []
  for(let r of rows){
    const KPP = await DIM_KANTOR.findOne({ KD_KPP: r }, 'NM_KANTOR')
    const TARGET = await DIM_TARGET_EKSTEN.findOne({ KD_KPP: r }, 'TARGET')
    const dt1 = { KD_KPP: r, NAMA_KPP: KPP._doc.NM_KANTOR, TARGET: TARGET._doc.TARGET }
    for(let c of columns){
      const dt2 = data.find(d => d._id.KPPADM == r && d._id[Object.keys(d._id)[1]] == c)
      dt1[c] = dt2 ? dt2.JML_SETOR : 0
    }
    data2.push(dt1)
  }
  return Promise.resolve(data2)
}

const generatePenerimaanPerBln = async () => {
  try {
    console.log(`Generating Data...`)
    const t0 = Date.now()
    let mpn = await MPN.aggregate([
      {
        $group: {
          _id: { KPPADM: '$KPPADM_SETOR', BULAN: { $month: '$TGL_SETOR' } },
          JML_SETOR: { $sum: '$JML_SETOR' }
        }
      },
    ])
    mpn = await pivotData(mpn)
    const t1 = Date.now()
    console.log(`Generating Data Success in ${ (t1 - t0) / 1000 } Seconds...`)
  
    console.log(`Saving Data to Database...`)
    const t2 = Date.now()
    await G_PENERIMAAN.findOneAndUpdate({ PID: 1 }, {
      PID: 1,
      NAME: 'PENERIMAAN PER BULAN',
      DATA: mpn,
      TGL_UPDATE: new Date()
    }, { upsert: true })
    const t3 = Date.now()
    console.log(`Saving Data to Database Success in ${ (t3 - t2) / 1000 } Seconds...`)

    console.log(`Operation Success in ${ (t3 - t0) / 1000 } Seconds...`)
    Promise.resolve('ok')
  } catch (err) {
    Promise.reject(err)
  }
}
module.exports = generatePenerimaanPerBln

if(process.argv[2] == 'run'){
  const mongoose = require('mongoose')

  mongoose.connect('mongodb://localhost:27017/infografis', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false
  }, async () => {
    await generatePenerimaanPerBln()
    process.exit() 
  })
}