const cheerio = require('cheerio')
const rp = require('request-promise').defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true,
    resolveWithFullResponse: true
})

const { IP_SIKKA, PASS_SIKKA } = process.env
const mainUrl = 'http://approweb.intranet.pajak.go.id'
const loginUrl = 'http://approweb.intranet.pajak.go.id/index.php?r=site/index'
const STPKWL = require('../../models/stpKwlModel')
const STPKPP = require('../../models/stpKppModel')
const STPAR = require('../../models/stpArModel')
const STPWP = require('../../models/stpWpModel')

const getDataAndImportStp = (req, res) => {
    const url = 'http://approweb.intranet.pajak.go.id/index.php?r=pengawasan/terbitSTP&profile_id=080'
    const { bulanAwal, bulanAkhir, tahun } = req.body
    let apprCSRF
    let $

    const getApprCSRF = body => {
        const $ = cheerio.load(body)
        const apprCSRF = $('[name="apprCSRF"]').get(0)
        if(!apprCSRF){
            return ""
        } else {
            return apprCSRF.attribs.value
        }
    }

    const getDataAndImportStpWp = async (resp, kd_kpp, nip_ar) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('#stpwp tr')
        if(!rows.length) return false
        for(let r = 1; r < rows.length - 1; r++){
            let cells = $($(rows[r]).find('td'))
            const d = { 'KD_KPP': kd_kpp, 'NIP_AR': nip_ar }
            for(let c = 1; c <= cells.length - 1; c++){
                const txt = $(cells[c]).text().trim()
                switch(c){
                    case 1: d['NM_WP'] = txt
                        break
                    case 2: d['NPWP'] = txt.replace(/\.|\-/g, '')
                        break
                    case 3: d['JML_STP'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['NILAI_IDR'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['NILAI_USD'] = parseInt(txt.replace(/\,/g, ''))
                }
            }
            data.push({
                updateOne: {
                    filter: { NPWP: d.NPWP },
                    update: d,
                    upsert: true
                }
            })
        }
        console.log(`Menambahkan Data STP WP AR ${ nip_ar }...`)
        await STPWP.bulkWrite(data)
        console.log(`${ data.length } Data STP WP AR ${ nip_ar } Ditambahkan...`)
    }

    const getDataAndImportStpAr = async (resp, kd_kpp) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('table tr')
        let firstIdx, lastIdx = rows.length - 1

        for(let r = 0; r< rows.length; r++){
            const txt = $(rows[r]).text()
            if(txt.match(/Eksten/)) firstIdx = r + 1
            if(txt.match('Non Waskon')) lastIdx = r
        }

        if(!firstIdx) return false
        for(let r = firstIdx; r < lastIdx; r++){
            let cells = $($(rows[r]).find('td'))
            const d = { 'KD_KPP': kd_kpp }
            for(let c = 1; c <= cells.length - 1; c++){
                const txt = $(cells[c]).text().trim()
                switch(c){
                    case 1: d['NIP_AR'] = txt.substring(1, 10), d['NM_AR'] = txt.substring(12)
                        break
                    case 2: d['JML_STP'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 3: d['JML_WP'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['NILAI_IDR'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['NILAI_USD'] = parseInt(txt.replace(/\,/g, ''))
                }
            }
            data.push({
                updateOne: {
                    filter: { NIP_AR: d.NIP_AR },
                    update: d,
                    upsert: true
                }
            })
        }
        console.log(`Menambahkan Data STP AR KPP ${ kd_kpp }...`)
        await STPAR.bulkWrite(data)
        console.log(`${ data.length } Data STP AR KPP ${ kd_kpp } Ditambahkan...`)

        for(let r = firstIdx; r < lastIdx; r++){
            let nip_ar = $($(rows[r]).find('td')[1]).text().trim().substring(1,10)
            let link = $(rows[r]).find('a').attr('href')
            await rp.get(mainUrl + link).then(async resp => {
                await getDataAndImportStpWp(resp, kd_kpp, nip_ar)
            })
        }
    }

    const getDataAndImportStpKpp = async resp => {
        $ = cheerio.load(resp.body)
        const links = $('#stpkpp1 a')
        for(let l = 0; l < links.length; l++){
            let kd_kpp = $(links[l]).text().trim().substring(1,4)
            await rp.get(mainUrl + $(links[l]).attr('href')).then(async resp => {
                await getDataAndImportStpAr(resp, kd_kpp)
            })
        }

        const data = await STPAR.aggregate([
            { 
                $group: {
                    _id: '$KD_KPP',
                    JML_STP: { $sum: '$JML_STP' },
                    JML_WP: { $sum: '$JML_WP' },
                    NILAI_IDR: { $sum: '$NILAI_IDR' },
                    NILAI_USD: { $sum: '$NILAI_USD' }
                } 
            }
        ])
        for(let i in data){
            data[i] = { 
                updateOne: {
                    filter: { KD_KPP: data[i]['_id'] },
                    update: {
                        ...data[i],
                        KD_KPP: data[i]['_id'],
                        KD_KWL: '090'
                    },
                    upsert: true
                }
            }
            delete(data[i].updateOne.update['_id'])
        }
        await STPKPP.bulkWrite(data)
        console.log(`${ data.length } Data STP KPP KANWIL 090 Ditambahkan...`)
    }

    const getDataAndImportStpKwl = async resp => {
        $ = cheerio.load(resp.body)
        let link = $('#tabelaku a')[0].attribs.href
        await rp.get(mainUrl + link).then(async resp => {
            await getDataAndImportStpKpp(resp)
        })

        const data = await STPKPP.aggregate([
            { 
                $group: {
                    _id: '$KD_KWL',
                    JML_STP: { $sum: '$JML_STP' },
                    JML_WP: { $sum: '$JML_WP' },
                    NILAI_IDR: { $sum: '$NILAI_IDR' }, 
                    NILAI_USD: { $sum: '$NILAI_USD' } 
                } 
            }
        ])
        for(let i in data){
            data[i] = { 
                updateOne: {
                    filter: { KD_KWL: data[i]['_id'] },
                    update: {
                        ...data[i],
                        KD_KWL: data[i]['_id']
                    },
                    upsert: true
                }
            }
            delete(data[i].updateOne.update['_id'])
        }
        await STPKWL.bulkWrite(data)
        console.log(`${ data.length } Data STP KANWIL 090 Ditambahkan...`)
    }

    rp.get(loginUrl).then(resp => {
        console.log('Mencoba Login Approweb...')
        if(resp.request.uri.query === 'r=site/index'){
            apprCSRF = getApprCSRF(resp.body)
            return rp.post(loginUrl, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `apprCSRF=${ apprCSRF }&LoginForm%5Bip%5D=${ IP_SIKKA }&LoginForm%5BkataSandi%5D=${ PASS_SIKKA }`,
            })
        } else {
            return rp.get(mainUrl + '/index.php?r=userPref/home/tema')
        }
    }).then(resp => {
        console.log('Login Berhasil...')
        if(resp.request.uri.query === 'r=userPref/home/tema') apprCSRF = getApprCSRF(resp.body)
        return rp.post(url, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `apprCSRF=${ apprCSRF }&PeriodeAwasModel%5BbulanAwal%5D=${ bulanAwal }&PeriodeAwasModel%5BbulanAkhir%5D=${ bulanAkhir }&PeriodeAwasModel%5Btahun%5D=${ tahun }&yt0=Proses`
        })
    }).then(async resp => {
        await getDataAndImportStpKwl(resp)
        console.log('Data STP Berhasil Disimpan...')
        res.json({ ok: true })
    }).catch(err => {
        console.log('Gagal Mengambil Data')
        res.json({ ok: false, err })
    })
}

module.exports = getDataAndImportStp