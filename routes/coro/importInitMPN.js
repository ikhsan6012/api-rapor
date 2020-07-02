const { Client } = require('pg')

const generatePenerimaanPerBln = require('./generatePenerimaanPerBln')
const generatePenerimaanPerSbrData = require('./generatePenerimaanPerSbrData')
const generatePenerimaanPerThnDaftar = require('./generatePenerimaanPerThnDaftar')
const generatePenerimaanPerJnsWp = require('./generatePenerimaanPerJnsWp')

const MPN = require('../../models/mpnModel')
const DIM_KONVERSI_PEMERIKSAAN = require('../../models/dimKonversiPemeriksaanModel')

const importInitMPN = async (req, res) => {
  try{
    console.log(`Connecting to Database...`)
    const t0 = Date.now()
    const client = new Client({
      user: '910222315',
      host: 'coro-rawdata',
      database: 'djpolap2',
      password: 'Ngantor10',
      port: 35432,
    })
    await client.connect()
    const t1 = Date.now()
    console.log(`Connecting to Database Success in ${ (t1 - t0) / 1000 } Seconds...`)
    
    console.log(`Getting Data...`)
    const t2 = Date.now()
    const dimKonversiPemeriksaan = await DIM_KONVERSI_PEMERIKSAAN.find({ 
      PEMERIKSA_PAJAK: 'PPP'
    }, '-_id KD_PEMERIKSAAN')

    let KD_PEMERIKSAAN = ''
    for(let i = 0; i < dimKonversiPemeriksaan.length; i++){
      KD_PEMERIKSAAN += `'${ dimKonversiPemeriksaan[i]._doc.KD_PEMERIKSAAN }'`
      if(i != dimKonversiPemeriksaan.length - 1){
        KD_PEMERIKSAAN += ', '
      }
    }
    const mpn = await client.query(`
      select A.*
      from "PENERIMAAN" A
      left join "WP" B on A."NPWP_PENYETOR" = B."NPWP"
      left join "WP_TLTB" C on A."NPWP_PENYETOR" = C."NPWP"
      left join "OBJEK_PENAGIHAN" D on A."NO_SK" = D."NO_PRODUK_HUKUM_REF"
      left join "SURAT_TEGURAN_D" E on D."ID_OBJEK_PENAGIHAN" = E."ID_OBJEK_PENAGIHAN"
      left join "STPSKP_H" F on A.NO_SK = F."NO_STPSKP"
      where A."KPPADM_SETOR" in ('031','032','033','034','035','036','037','039','085','086')
        and A."TGL_SETOR" between '2019-01-01' and '2019-12-31'
        and (B."TGL_DAFTAR" between '2018-01-01' and '2019-12-31'
          or C."NPWP" is not null)
        and A."ID_SBR_DATA" <> 3
        and A."KD_SETOR" not between '500' and '511'
        and A."KD_SETOR" <> '199'
        and E."ID_SURAT_TEGURAN_D" is null
        and (F."KD_PEMERIKSAAN" is null
          or F."KD_PEMERIKSAAN" in (${ KD_PEMERIKSAAN }))
    `)
    const t3 = Date.now()
    console.log(`Getting ${ mpn.rowCount } Data Success in ${ (t3 - t2) / 1000 } Seconds...`)
    
    console.log(`Importing ${ mpn.rowCount } Data...`)
    const t4 = Date.now()
    await MPN.collection.drop()
    while(mpn.rows.length){
      await MPN.insertMany(mpn.rows.splice(0,10000), { ordered: false })
    }

    const t5 = Date.now()
    console.log(`Importing ${ mpn.rowCount } Data Success in ${ (t5 - t4) / 1000 } Seconds...`)

    await generatePenerimaanPerBln()
    await generatePenerimaanPerSbrData()
    await generatePenerimaanPerThnDaftar()
    await generatePenerimaanPerJnsWp()

    console.log(`Operation Success in ${ (t5 - t0) / 1000 } Seconds...`)
  } catch(err){
    console.log(err)
  }
}
module.exports =  importInitMPN