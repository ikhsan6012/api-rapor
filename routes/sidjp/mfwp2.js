const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const csvjson = require('csvjson')
const rp = require('request-promise').defaults({
  jar: true,
  rejectUnauthorized: false,
  followAllRedirects: true,
	resolveWithFullResponse: true
})

const MFWP = require('../../models/mfwpModel')

const { IP_SIKKA, PASS_SIKKA } = process.env
const mainUrl = 'https://appportal'
const ua = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36' }

const zeroPad = (num, places) => {
  return String(num).padStart(places, '0')
}

const normalizeDate = date => {
  if(new Date(date) == 'Invalid Date'){
    let [d,m,y] = date.split('-').map((e, i) => {
      e = parseInt(e)
      if(i == 1) e = e - 1
      return e
    })
    return new Date(y, m, d)
  }
  return new Date(date)
}

const getKdSeksi = seksi => {
  switch (seksi) {
    case 'Seksi Ekstensifikasi dan Penyuluhan': seksi = 0; break
    case 'Seksi Pengawasan dan Konsultasi I': seksi = 1; break
    case 'Seksi Pengawasan dan Konsultasi II': seksi = 2; break
    case 'Seksi Pengawasan dan Konsultasi III': seksi = 3; break
    case 'Seksi Pengawasan dan Konsultasi IV': seksi = 4; break
  }
  return seksi
}

const getDataApportal = async (wp, fileName, idx) => {
  try{
    console.log(fileName, idx, `Getting Data WP ${ wp.NPWP } From Appportal...`)
    let resp, $, link
  
    resp = await rp.post(mainUrl + '/portal/masterfile/hasil.php', {
      form: { input: wp.NPWP.substring(0, 9), kriteria1: 1, kriteria2: 1 }
    })
    $ = cheerio.load(resp.body)
  
    const rows = $('tr')
    if(rows.length <= 1) return false
    for(let r = 1; r < rows.length; r++){
      const a = $(rows[r]).find('a')
      const npwp = a.text().trim().replace(/\.|\-/g, '')
      if(wp.NPWP == npwp){
        link = a.attr('href')
        break
      }
    }
  
    resp = await rp.post(mainUrl + '/portal/' + link)
    $ = cheerio.load(resp.body)
    
    const addr = $('.col-sm-5.invoice-col').text().trim().split('\n')
    const info = $('.col-sm-3.invoice-col').text().trim().split('\n')
    const info2 = $('.col-sm-4.invoice-col').text().trim().split('\n')
    const date = normalizeDate(info[1].trim().substring(17))
    const usaha = $($('table')[0])
    const pkp = $($('table')[1])
    const kewajiban = $('.fa-check').parent().parent().find('td:nth-child(2)')
    
    wp.JENIS_WP = $('h4>center').first().text().trim().substring(12) || ''
    wp.ALAMAT = addr[1].trim().substring(7) || ''
    wp.KELURAHAN = addr[2].trim().split(/\:\s|\,\s/g)[1]  || ''
    wp.KECAMATAN = addr[2].trim().split(/\:\s|\,\s/g)[2]  || ''
    wp.KOTA = addr[2].trim().split(/\:\s|\,\s/g)[3]  || ''
    wp.PROVINSI = addr[2].trim().split(/\:\s|\,\s/g)[4]  || ''
    wp.TELP = addr[3].trim().substring(9) || ''
    wp.EMAIL = addr[4].trim().substring(7) || ''
    wp.NIK = wp.JENIS_WP == 'ORANG PRIBADI'
      ? addr[6].trim().substring(11)
      : ''
    wp.ID_REGISTER = info[0].trim().substring(10) || ''
    wp.TGL_DAFTAR = zeroPad(date.getDate(), 2) || ''
    wp.BLN_DAFTAR = zeroPad(date.getMonth() + 1, 2) || ''
    wp.THN_DAFTAR = zeroPad(date.getFullYear(), 2) || ''
    wp.STATUS_WP = info[2].trim().substring(15) || ''
    wp.TEMPAT_LAHIR = wp.JENIS_WP == 'ORANG PRIBADI'
      ? info[5].trim().substring(11)
      : ''
    wp.TGL_LAHIR = wp.JENIS_WP == 'ORANG PRIBADI'
      ? info[6].trim().substring(15)
      : info[5].trim().substring(15)
    wp.KD_SEKSI = getKdSeksi(info2[0].trim().substring(8))
    wp.NIP_AR = info2[1].trim().substring(10) || ''
    wp.NIP_ATASAN_AR = info2[3].trim().substring(16) || ''
    if(wp.JENIS_WP == 'ORANG PRIBADI'){
      wp.BADAN_HUKUM = usaha.find('tr:nth-child(1)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.STATUS_MODAL = usaha.find('tr:nth-child(2)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.STATUS_USAHA = usaha.find('tr:nth-child(3)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.KD_KLU = usaha.find('tr:nth-child(4)>td:nth-child(2)').text().substring(2, 7) || ''
    } else {
      wp.PENANGGUNGJAWAB = usaha.find('tr:nth-child(1)>td:nth-child(2)').text().trim() || ''
      wp.BADAN_HUKUM = usaha.find('tr:nth-child(2)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.STATUS_MODAL = usaha.find('tr:nth-child(3)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.STATUS_USAHA = usaha.find('tr:nth-child(4)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
      wp.KD_KLU = usaha.find('tr:nth-child(5)>td:nth-child(2)').text().substring(2, 7) || ''
    }
    wp.STATUS_PKP = pkp.find('tr:nth-child(1)>td:nth-child(2)').text().split(/\]\s/)[1] || ''
    wp.NO_PKP = pkp.find('tr:nth-child(2)>td:nth-child(2)').text().trim() || ''
    wp.TGL_PKP = pkp.find('tr:nth-child(3)>td:nth-child(2)').text().trim() || ''
    wp.NO_CABUT_PKP = pkp.find('tr:nth-child(4)>td:nth-child(2)').text().trim() || ''
    wp.TGL_CABUT_PKP = pkp.find('tr:nth-child(5)>td:nth-child(2)').text().trim() || ''
    wp.KEWAJIBAN = []
    for(k = 0; k < kewajiban.length; k++) wp.KEWAJIBAN.push($(kewajiban[k]).text())
  
    return Promise.resolve(wp)
  } catch (err){
    return Promise.resolve(false)
  }
}

const getDataWp = async (initData, fileName) => {
  const data = []
  for(let i = 0; i < initData.length; i++){
    let wp = {
      KD_KPP: fileName.split(/\_/g)[1],
      NPWP: initData[i].NPWP.replace(/\.|\-/g, ''),
      NAMA_WP: initData[i]['Nama WP'],
    }

    wp = await getDataApportal(wp, fileName, i)
    if(wp) data.push(wp)
  }
  return Promise.resolve(data)
}

const loginApportal = () => {
  return rp.post(mainUrl + '/login/login/loging_simpel', {
    headers: { ...ua },
    form: { username: IP_SIKKA, password: PASS_SIKKA, sublogin: 'Login' }
  })
}

const saveData = data => {
  const update = []
  for(let d of data) update.push({
    updateOne: {
      filter: { NPWP: d.NPWP },
      update: d,
      upsert: true
    }
  })
  Promise.resolve(MFWP.bulkWrite(update, {
    ordered: false
  }))
}

const importMfwp = async (req, res) => {
  // Folder MFWP
  console.log('Reading MFWP Folder...')
  const mfwpDir = path.join(__dirname, '..', '..', '..', '..', 'MFWP')
  const mfwpBaDir = path.join(__dirname, '..', '..', '..', '..', 'MFWP BA')
  const mfwpFiles = fs.readdirSync(mfwpDir)
  const mfwpBaFiles = fs.readdirSync(mfwpBaDir)

  // Login Appportal
  console.log('Login Appportal...')
  await loginApportal()
  console.log('Login Success...')

  // Delete Old MFWP
  console.log('Delete Old MFWP...')
  await MFWP.remove()
  console.log('Delete Success...')

  for(let i in mfwpFiles){
    console.log(`Reading File ${ mfwpFiles[i] }...`)
    const csv = await fs.readFileSync(path.join(mfwpDir, mfwpFiles[i]), 'ucs2')
    const initData = await csvjson.toObject(csv, {
      quote: '"',
      delimiter: '\t'
    })
    const data = await getDataWp(initData, mfwpFiles[i])

    // Save Data
    console.log(`Saving Data MFWP ${ mfwpFiles[i] }...`)
    const resp = await saveData(data)
    console.log(`Saving Data MFWP ${ mfwpFiles[i] } Success...`)
    console.log(`${ resp.modifiedCount } Data Modified, ${ resp.upsertedCount } Data Inserted...`)
  }

  for(let i in mfwpBaFiles){
    console.log(`Reading File ${ mfwpFiles[i] }...`)
    const csv = await fs.readFileSync(path.join(mfwpBaDir, mfwpBaFiles[i]), 'ucs2')
    const initData = await csvjson.toObject(csv, {
      quote: '"',
      delimiter: '\t'
    })
    const data = await getDataWp(initData, mfwpBaFiles[i])
    
    // Save Data
    console.log(`Saving Data MFWP ${ mfwpBaFiles[i] }...`)
    const resp = await saveData(data)
    console.log(`Saving Data MFWP ${ mfwpBaFiles[i] } Success...`)
    console.log(`${ resp.modifiedCount } Data Modified, ${ resp.upsertedCount } Data Inserted...`)
  }

  res.json({ ok: true })
}

module.exports = importMfwp