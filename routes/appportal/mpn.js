const cheerio = require('cheerio')
const mongoose = require('mongoose')
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

const getInitData = headers => {
  const initData = {}
  for(h of headers) initData[h] = ''
  return initData
}

const getDataWp = async link => {
  let resp, $
  const data = {}

  resp = await rp.get(mainUrl + '/portal/' + link)
  $ = cheerio.load(resp.body)
  data.KD_KLU = $('.table-condensed').first().find('tbody>tr:nth-child(5)>td:nth-child(2)').text().substring(2, 7)
  
}

const getWp = async d => {
  let resp

  resp = await rp.post(mainUrl + '/portal/masterfile/hasil.php', {
    form: { input: d.NPWP, kriteria1: 1, kriteria2: 1 }
  })

  const npwpMpn = `${ d.NPWP }-${ d.KPP }.${ d.CAB }`
  const $ = cheerio.load(resp.body)
  const rows = $('#tabhasil')

  const wp = {
    NPWP: npwpMpn,
    NAMA_WP: d.NAMA,
    STATUS_WP: 'Pindah'
  }
  for(let r = 0; r < rows.length; r++){
    const npwpApportal = $(rows[r]).find('a')
    if(npwpMpn == npwpApportal.text().trim()){
      wp.KD_KPP = $(rows[r]).find('td:nth-child(11)').text().split(' - ')[0]
      const link = npwpApportal.attr('href')
      // await rp.get(mainUrl + '/portal/' + link)
    }
  }
  console.log(wp)
}

const getDataMpn = async (data, KPPADM_SAATSETOR, TAHUN, BULAN) => {
  const mpn = []
  for(let d of data){
    const wp = await MFWP.findOne({ NPWP: d.NPWP + d.KPP + d.CAB })
    if(!wp){
      await getWp(d)
    }
    
    mpn.push({
      KPPADM_SAATSETOR,
      TAHUN,
      BULAN,
      KPPADM: d.KPP,
      NPWP: d.NPWP + d.KPP + d.CAB,
    })
  }
  // console.log(mpn)
  return mpn
}

const login = () => {
  return rp.post(mainUrl + '/login/login/loging_simpel', {
    headers: { ...ua },
    form: { username: IP_SIKKA, password: PASS_SIKKA, sublogin: 'Login' }
  })
}

const getMpn = async (initData, kd_kpp, tahun, bulan, valuta) => {
  for(let k of kd_kpp){
    for(let t of tahun){
      for(let b of bulan){
        for(let v of valuta){
          const p1 = `${k}${t}4111000000131${b}${v}`
          const url = mainUrl + `/portal/download/lsnfjkasbnfjnasjkfnjbnjnjknbkjnfjknbjkfnbkjfnbi3939489184.php?p1=${p1}`
          const resp = await rp.get(url)
          const data = csvjson.toObject(resp.body, {
            delimiter: ',', quote: '"'
          })

          // console.log(data[0])
          await getDataMpn(data, k, t, b)
        }
      }
    }
  }
}

const getDataAndImportMpn = async (req, res) => {
  let { type, valuta, kd_kpp, bulan1, bulan2, tahun } = req.body
  let resp
  
  tahun = tahun ? tahun.split() : []
  bulan1 = parseInt(bulan1)
  bulan2 = parseInt(bulan2)
  let bulan = []
  for(let b = bulan1; b <= bulan2; b++){
    bulan.push(String(b).padStart(2, '0'))
  }
  
  switch(type){
    case 'all':
      type = ['mpn', 'spm', 'pbk']
      break
    default:
      type = type.split(',')
  }

  switch(valuta){
    case 'all': 
      valuta = ['1', '2', '3']
      break
    default:
      valuta = valuta.split(',')
  }

  switch(kd_kpp){
    case 'all':
      kd_kpp = ['031', '032', '033', '034', '035', '036', '037', '038', '039', '085', '086']
      break
    default:
      kd_kpp = kd_kpp.split(',')
  }   

  const headers = 'KPPADM_SAATSETOR	TAHUN	BULAN	KPPADM	NPWP	NAMA_WP	JENIS_WP	TGL_DAFTAR	THN_DAFTAR	ID_MAP_KJS	JNSPJK	NAMAMAP	KDSTR	NAMAKJS	MSPAJAK	NOSKPSSP	TGLBYR	RPJMLBYR	NTPN	ID_SBR_DATA	BANK	NIP_9	NIP18	NAMA	NAMA_UNIT_ES4	NAMA_KANTOR	XX	POSISI'.split('\t')
  const initData = getInitData(headers)
  
  console.log('Login Apportal...')
  await login()
  console.log('Login Berhasil...')

  if(type.includes('mpn')){
    await getMpn(initData, kd_kpp, tahun, bulan, valuta)
  }
}

module.exports = getDataAndImportMpn