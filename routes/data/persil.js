const cheerio = require('cheerio')
const rp = require('request-promise').defaults({
  jar: true,
  rejectUnauthorized: false,
  followAllRedirects: true,
  resolveWithFullResponse: true
})

const { IP_PERSIL, PASS_PERSIL } = process.env

const getUpdateInfo = async () => {
  const url = 'http://persil/home.php'
  let resp = await rp.get(url)
  
  let $ = cheerio.load(resp.body)

  const ee = $('table>tbody>tr:nth-child(2)>td:nth-child(1) font[color="green"]').text().trim()
  const penambahanWp = $('table>tbody>tr:nth-child(2)>td:nth-child(2) font[color="green"]').text().trim()
  const tagging = $('table>tbody>tr:nth-child(2)>td:nth-child(3) font[color="green"]').text().trim()
  return Promise.resolve({ ee, penambahanWp, tagging })
}

const getEE = async () => {
  const url = 'http://persil/monitor/ee_kppsmry.php?cmd=search&sv_KANWIL_DJP=JAKARTA+BARAT'
  let resp = await rp.get(url)

  let $ = cheerio.load(resp.body)
  const rows = $('.ewTable>tbody>tr')

  const data = []
  for(let r = 0; r < rows.length; r++){
    const cells = $(rows[r]).find('td')
    data.push({
      KD_KPP: $(cells[1]).text().trim().padStart(3, '0'),
      NAMA_KPP: $(cells[2]).text().trim(),
      TARGET: parseInt($(cells[3]).text().trim().replace(/\,/g, '')),
      MPN: parseInt($(cells[4]).text().trim().replace(/\,/g, '')),
      SPM: parseInt($(cells[5]).text().trim().replace(/\,/g, '')),
      PBK: parseInt($(cells[6]).text().trim().replace(/\,/g, '')),
    })
  }
  return Promise.resolve(data)
}

const getPenambahanWP = async () => {
  const url = 'http://persil/monitor/wp_eksten_per_kppsmry.php?cmd=search&sv_KANWIL_DJP=JAKARTA+BARAT'
  let resp = await rp.get(url)

  let $ = cheerio.load(resp.body)
  const rows = $('.ewTable>tbody>tr')

  const data = []
  for(let r = 0; r < rows.length; r++){
    const cells = $(rows[r]).find('td')
    data.push({
      KD_KPP: $(cells[1]).text().trim().padStart(3, '0'),
      NAMA_KPP: $(cells[2]).text().trim(),
      BADAN: parseInt($(cells[3]).text().trim().replace(/\,/g, '')),
      OP_K: parseInt($(cells[4]).text().trim().replace(/\,/g, '')),
      OP_NK: parseInt($(cells[5]).text().trim().replace(/\,/g, '')),
      BENDAHARA: parseInt($(cells[6]).text().trim().replace(/\,/g, '')),
      TOTAL: parseInt($(cells[7]).text().trim().replace(/\,/g, '')),
      TARGET: parseInt($(cells[8]).text().trim().replace(/\,/g, '')),
    })
  }
  return Promise.resolve(data)
}

const getWPBaruBayar = async () => {
  const url = 'http://persil/monitor/pembayaran_kppsmry.php?cmd=search&sv_KANWIL_DJP=JAKARTA+BARAT'
  let resp = await rp.get(url)

  let $ = cheerio.load(resp.body)
  const rows = $('.ewTable>tbody>tr')

  const data = []
  for(let r = 0; r < rows.length; r++){
    const cells = $(rows[r]).find('td')
    data.push({
      KD_KPP: $(cells[1]).text().trim().padStart(3, '0'),
      NAMA_KPP: $(cells[2]).text().trim(),
      TARGET: parseInt($(cells[3]).text().trim().replace(/\,/g, '')),
      OP_NK_2019: parseInt($(cells[4]).text().trim().replace(/\,/g, '')),
      BADAN_2019: parseInt($(cells[5]).text().trim().replace(/\,/g, '')),
      OP_NK_2018: parseInt($(cells[7]).text().trim().replace(/\,/g, '')),
      BADAN_2018: parseInt($(cells[8]).text().trim().replace(/\,/g, '')),
      OP_NK_TLTB: parseInt($(cells[10]).text().trim().replace(/\,/g, '')),
      BADAN_TLTB: parseInt($(cells[11]).text().trim().replace(/\,/g, '')),
    })
  }
  return Promise.resolve(data)
}

const getKepatuhanWP = async () => {
  const url = 'http://persil/monitor/kepatuhan_kppsmry.php?cmd=search&sv_KANWIL_DJP=JAKARTA+BARAT'
  let resp = await rp.get(url)

  let $ = cheerio.load(resp.body)
  const rows = $('.ewTable>tbody>tr')

  const data = []
  for(let r = 0; r < rows.length; r++){
    const cells = $(rows[r]).find('td')
    data.push({
      KD_KPP: $(cells[1]).text().trim().padStart(3, '0'),
      NAMA_KPP: $(cells[2]).text().trim(),
      TARGET: parseInt($(cells[3]).text().trim().replace(/\,/g, '')),
      BADAN: parseInt($(cells[4]).text().trim().replace(/\,/g, '')),
      OP_NK: parseInt($(cells[5]).text().trim().replace(/\,/g, '')),
      WP_TLTB: parseInt($(cells[6]).text().trim().replace(/\,/g, '')),
    })
  }
  return Promise.resolve(data)
}

const getTagging = async () => {
  const url = 'http://persil/monitor/iku_kppsmry.php?cmd=search&sv_KANWIL_DJP=JAKARTA+BARAT'
  let resp = await rp.get(url)

  let $ = cheerio.load(resp.body)
  const rows = $('.ewTable>tbody>tr')

  const data = []
  for(let r = 0; r < rows.length; r++){
    const cells = $(rows[r]).find('td')
    data.push({
      NAMA_KPP: $(cells[1]).text().trim(),
      TARGET_SMT1: parseInt($(cells[2]).text().trim().replace(/\,/g, '')),
      REALISASI_SMT1: parseInt($(cells[3]).text().trim().replace(/\,/g, '')),
      TARGET_SMT2: parseInt($(cells[6]).text().trim().replace(/\,/g, '')),
      REALISASI_SMT2: parseInt($(cells[7]).text().trim().replace(/\,/g, '')),
    })
  }
  return Promise.resolve(data)
}

const getPersil = async (req, res) => {
  const { t } = req.query
  // Login Persil
  await rp.post('http://persil/login.php', {
    form: { username: IP_PERSIL, password: PASS_PERSIL }
  })

  const data = {
    updateInfo: await getUpdateInfo()
  }

  switch(parseInt(t)){
    case 1:
      data.ee = await getEE()
      break
    case 2:
      data.penambahanWp = await getPenambahanWP()
      break
    case 3:
      data.wpBaruBayar = await getWPBaruBayar()
      break
    case 4:
      data.wpPatuh = await getKepatuhanWP()
      break
    case 5:
      data.tagging = await getTagging()
      break
    default:
      data.ee = await getEE()
      data.penambahanWp = await getPenambahanWP()
      data.wpBaruBayar = await getWPBaruBayar()
      data.wpPatuh = await getKepatuhanWP()
      data.tagging = await getTagging()
  }
  
  await rp.get('http://persil/logout.php')
  res.json(data)
}

module.exports = getPersil