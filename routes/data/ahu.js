const username = '060087194'
const password = '87654321Qwerty'
const mainUrl = 'https://appportal'
const resDir = String.raw`//10.5.254.88/data pep/2019/AHU`

const fs = require('fs')
const path = require('path')
const csvjson = require('csvjson')
const xlsx = require('xlsx')
const rp = require('request-promise').defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true,
    resolveWithFullResponse: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36' }
})

const sedotAhu = async (req, res) => {
  try {
    await rp.post(mainUrl + '/login/login/loging_simpel', {
      form: { username, password, sublogin: 'Login' }
    })
  } catch (err) {
    console.log(err)
    res.json({ ok: false })
  }

  const csvString = await fs.readFileSync(path.join(__dirname, '..', '..', 'local', 'ahubadan.csv'), 'utf8')
  const data = await csvjson.toObject(csvString, {
      delimiter: ',', quote: '"'
  })

  for(let i = 0; i <= data.length; i++){
    if(!data[i]) continue
    console.log(`${ i + 1 } dari ${ data.length }`)
    try {
      const resp = await rp.post(mainUrl + '/ahu/get_data.php', {
        form: { npwp: data[i].NPWP },
        page: 1
      })
      const dt = JSON.parse(resp.body)
      if(dt.length){
        data[i] = { ...data[i], ...dt[0] }
      }
    } catch (err) {
      console.log(err)
      continue
    }
  }
  
  const wb = xlsx.utils.book_new()
  const ws = xlsx.utils.json_to_sheet(data)
  xlsx.utils.book_append_sheet(wb, ws)
  xlsx.writeFile(wb, path.join(resDir, 'hasil.xlsx'))
  res.json({ ok: true })
}

module.exports = sedotAhu