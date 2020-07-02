'use strict'
require('dotenv').config()
const rp = require('request-promise').defaults({
  jar: true,
  rejectUnauthorized: false,
  followAllRedirects: true,
  resolveWithFullResponse: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
  }
})
const fs = require('fs')
const path = require('path')

const { USER_WILDAN } = process.env
const { PASS_WILDAN } = process.env

const loginAppportal = async () => {
  const url = 'https://appportal/login/login/loging_simpel'
  const res = await rp.post(url, {
    form: {
      username: USER_WILDAN,
      password: PASS_WILDAN,
      sublogin: 'Login'
    }
  })
  if(res.headers.refresh) return {
    isLoggedIn: false, message: 'Login appportal gagal. Username atau Password salah'
  }
  return { isLoggedIn: true }
}

module.exports = async (req, res) => {
  const { npwp, tahun } = req.params
  res.set('Content-Type', 'application/download')
  res.set('Content-Disposition', 'attachment; filename=download.xls')
  res.set('Content-Transfer-Encoding', 'binary')
  res.set('Transfer-Encoding', 'chunked')

  const login = await loginAppportal()
  if(!login.isLoggedIn) return res.json(login)

  let keyword = npwp
  if(npwp.length === 15) keyword = npwp.slice(0, 9)

  await rp.get('http://appportal/pdedjbc_intranet/')
  await rp.post('https://appportal/pdedjbc_intranet/index.php/detilpib/download', {
    form: {
      criteria: 'npwp',
      keyword,
      bulan1: '01',
      bulan2: '12',
      tahun,
      offset: '1',
      limit: '10000'
    },
  })

  rp.get('https://appportal/pdedjbc_intranet/index.php/detilpib/export').pipe(res)
}

module.exports()