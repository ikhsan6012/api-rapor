const MPN = require('../../models/mpnModel')
const DIM_KANTOR = require('../../models/dimKantorModel')
const DIM_AR = require('../../models/dimAr')
const G_PENERIMAAN = require('../../models/gPenerimaanModel')
const DIM_TARGET_AR = require('../../models/dimTargetAr')

const pivotData = async data => {
  let rows = []
  let columns = []
  
  for(let d of data){
    rows.push({ KPPADM: d._id.KPPADM, NIP_AR: d._id.NIP_AR })
    columns.push(d._id[Object.keys(d._id)[2]])
  }
  rows = [...new Set([...rows])].sort()
  columns = [...new Set([...columns])].sort()

  const data2 = []
  for(let r of rows){
    const KPP = await DIM_KANTOR.findOne({ KD_KPP: r.KPPADM }, 'NM_KANTOR')
    const AR = await DIM_AR.findOne({ NIP_AR: r.NIP_AR }, 'NAMA_AR')
    const TARGET = await DIM_TARGET_AR.findOne({ TAHUN: 2019, NIP_AR: r.NIP_AR }, 'TARGET')
    const dt1 = { 
      KD_KPP: r.KPPADM, 
      NAMA_KPP: KPP._doc.NM_KANTOR, 
      NIP_AR: r.NIP_AR,
      NAMA_AR: AR ? AR._doc.NAMA_AR : 'LAINNYA',
      TARGET: TARGET ? TARGET._doc.TARGET : 0,
      BULAN: {},
    }
    for(let c of columns){
      const dt2 = data.find(d => {
        return d._id.KPPADM == r.KPPADM 
        && d._id.NIP_AR == r.NIP_AR && d._id[Object.keys(d._id)[2]] == c
      })
      dt1.BULAN[c] = dt2 ? dt2.JML_SETOR : 0
    }
    data2.push(dt1)
  }
  return Promise.resolve(data2)
}

const generatePenerimaanPerBlnAr = async () => {
  try {
    console.log(`Generating Data...`)
    const t0 = Date.now()
    let mpn = await MPN.aggregate([
      // { $limit: 10 },
      {
        $lookup: {
          from: 'DIM_SBR_DATA_MPN',
          localField: 'ID_SBR_DATA',
          foreignField: 'ID_SBR_DATA',
          as: 'DIM_SBR_DATA'
        }
      },
      { $unwind: '$DIM_SBR_DATA' },
      {
        $lookup: {
          from: 'MFWP',
          localField: 'NPWP_PENYETOR',
          foreignField: 'NPWP',
          as: 'MFWP'
        }
      },
      { $unwind: '$MFWP' },
      {
        $lookup: {
          from: 'DIM_JNS_WP',
          localField: 'MFWP.ID_JNS_WP',
          foreignField: 'ID_JNS_WP',
          as: 'DIM_JNS_WP'
        }
      },
      { $unwind: '$DIM_JNS_WP' },
      {
        $facet: {
          perBulan: [
            {
              $group: {
                _id: { KPPADM: '$KPPADM_SETOR', BULAN: { $month: '$TGL_SETOR' } },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perBulanAr: [
            {
              $group: {
                _id: { 
                  KPPADM: '$KPPADM_SETOR', 
                  NIP_AR: '$MFWP.NIP_AR', 
                  BULAN: { $month: '$TGL_SETOR' } 
                },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perThnDaftar: [
            {
              $group: {
                _id: { KPPADM: '$KPPADM_SETOR', THN_DAFTAR: '$MFWP.THN_DAFTAR' },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perThnDaftarAr: [
            {
              $group: {
                _id: { 
                  KPPADM: '$KPPADM_SETOR', 
                  NIP_AR: '$MFWP.NIP_AR', 
                  THN_DAFTAR: '$MFWP.THN_DAFTAR', 
                },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perSbrData: [
            {
              $group: {
                _id: { KPPADM: '$KPPADM_SETOR', SBR_DATA: '$DIM_SBR_DATA.KET' },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perSbrDataAr: [
            {
              $group: {
                _id: { 
                  KPPADM: '$KPPADM_SETOR', 
                  NIP_AR: '$MFWP.NIP_AR', 
                  SBR_DATA: '$DIM_SBR_DATA.KET', 
                },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ],
          perJnsWp: [
            {
              $group: {
                _id: { KPPADM: '$KPPADM_SETOR', JNS_WP: '$DIM_JNS_WP.KET' },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            }
          ],
          perJnsWpAr: [
            {
              $group: {
                _id: { 
                  KPPADM: '$KPPADM_SETOR', 
                  NIP_AR: '$MFWP.NIP_AR', 
                  JNS_WP: '$DIM_JNS_WP.KET' 
                },
                JML_SETOR: { $sum: '$JML_SETOR' }
              }
            },
          ]
        },
      },
      {
        
      }
    ])
    mpn = await pivotData(mpn[0].perBulanAr)
    console.log(mpn)
    // const t1 = Date.now()
    // console.log(`Generating Data Success in ${ (t1 - t0) / 1000 } Seconds...`)
  
    // console.log(`Saving Data to Database...`)
    // const t2 = Date.now()
    // await G_PENERIMAAN.findOneAndUpdate({ PID: 1 }, {
    //   PID: 11,
    //   NAME: 'PENERIMAAN PER BULAN AR',
    //   DATA: mpn,
    //   TGL_UPDATE: new Date()
    // }, { upsert: true })
    // const t3 = Date.now()
    // console.log(`Saving Data to Database Success in ${ (t3 - t2) / 1000 } Seconds...`)

    // console.log(`Operation Success in ${ (t3 - t0) / 1000 } Seconds...`)
    // Promise.resolve('ok')
  } catch (err) {
    console.log(err)
    Promise.reject(err)
  }
}
module.exports = generatePenerimaanPerBlnAr

if(process.argv[2] == 'run'){
  const mongoose = require('mongoose')

  mongoose.connect('mongodb://localhost:27017/infografis', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false
  }, async (err) => {
    await generatePenerimaanPerBlnAr()
    process.exit() 
  })
}