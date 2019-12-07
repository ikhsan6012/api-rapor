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
const NONGALPOTKWL = require('../../models/nonGalpotKwlModel')
const NONGALPOTKPP = require('../../models/nonGalpotKppModel')
const NONGALPOTAR = require('../../models/nonGalpotArModel')
const NONGALPOTWP = require('../../models/nonGalpotWpModel')

const getDataAndImportNonGalpot = (req, res) => {
    const url = 'http://approweb.intranet.pajak.go.id/index.php?r=wasaktar/nonGalpot'
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

    const getDataAndImportNonGalpotWp = async (resp, kd_kpp, nip_ar) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('#nonGalpotWp tr')
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
                    case 3: d['KONSULTASI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['KORESPONDENSI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['KUNJUNGAN_AR'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 6: d['AKTIVITAS_LAINNYA'] = parseInt(txt.replace(/\,/g, ''))
                        break
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
        console.log(`Menambahkan Data Non Galpot WP AR ${ nip_ar }...`)
        await NONGALPOTWP.bulkWrite(data)
        console.log(`${ data.length } Data Non Galpot WP AR ${ nip_ar } Ditambahkan...`)
    }

    const getDataAndImportNonGalpotAr = async (resp, kd_kpp) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('#nongalpotAr tr')
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
                    case 2: d['JML_WP'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 3: d['KONSULTASI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['KORESPONDENSI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['KUNJUNGAN_AR'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 6: d['AKTIVITAS_LAINNYA'] = parseInt(txt.replace(/\,/g, ''))
                        break
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
        console.log(`Menambahkan Data Non Galpot AR KPP ${ kd_kpp }...`)
        await NONGALPOTAR.bulkWrite(data)
        console.log(`${ data.length } Data Non Galpot AR KPP ${ kd_kpp } Ditambahkan...`)

        for(let r = firstIdx; r < lastIdx; r++){
            let nip_ar = $($(rows[r]).find('td')[1]).text().trim().substring(1,10)
            let link = $(rows[r]).find('a').attr('href')
            await rp.get(mainUrl + link).then(async resp => {
                await getDataAndImportNonGalpotWp(resp, kd_kpp, nip_ar)
            })
        }
    }

    const getDataAndImportNonGalpotKpp = async resp => {
        $ = cheerio.load(resp.body)
        const links = $('#nonGalpot a')
        for(let l = 0; l < links.length; l++){
            let kd_kpp = $(links[l]).text().trim().substring(1,4)
            await rp.get(mainUrl + $(links[l]).attr('href')).then(async resp => {
                await getDataAndImportNonGalpotAr(resp, kd_kpp)
            })
        }

        const data = await NONGALPOTAR.aggregate([
            { 
                $group: {
                    _id: '$KD_KPP',
                    KONSULTASI: { $sum: '$KONSULTASI' },
                    KORESPONDENSI: { $sum: '$KORESPONDENSI' },
                    KUNJUNGAN_AR: { $sum: '$KUNJUNGAN_AR' },
                    AKTIVITAS_LAINNYA: { $sum: '$AKTIVITAS_LAINNYA' }
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
            delete data[i].updateOne.update['_id']
        }
        await NONGALPOTKPP.bulkWrite(data)
        console.log(`${ data.length } Data Non Galpot KPP KANWIL 090 Ditambahkan...`)
    }

    const getDataAndImportNonGalpotKwl = async resp => {
        $ = cheerio.load(resp.body)
        let link = $('#nonGalpot a').attr('href')
        await rp.get(mainUrl + link).then(async resp => {
            await getDataAndImportNonGalpotKpp(resp)
        })

        const data = await NONGALPOTKPP.aggregate([
            { 
                $group: {
                    _id: '$KD_KWL',
                    KONSULTASI: { $sum: '$KONSULTASI' },
                    KORESPONDENSI: { $sum: '$KORESPONDENSI' },
                    KUNJUNGAN_AR: { $sum: '$KUNJUNGAN_AR' },
                    AKTIVITAS_LAINNYA: { $sum: '$AKTIVITAS_LAINNYA' }
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
            delete data[i].updateOne.update['_id']
        }
        await NONGALPOTKWL.bulkWrite(data)
        console.log(`${ data.length } Data Non Galpot KANWIL 090 Ditambahkan...`)
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
            body: `apprCSRF=${ apprCSRF }&NonGalpotModel%5BbAwal%5D=${ bulanAwal }&NonGalpotModel%5BbAkhir%5D=${ bulanAkhir }&NonGalpotModel%5Btahun%5D=${ tahun }&yt0=Proses`
        })
    }).then(async resp => {
        await getDataAndImportNonGalpotKwl(resp)
        console.log('Data Non Galpot Berhasil Disimpan...')
        res.json({ ok: true })
    }).catch(err => {
        console.log('Gagal Mengambil Data')
        res.json({ ok: false, err })
    })
}

module.exports = getDataAndImportNonGalpot