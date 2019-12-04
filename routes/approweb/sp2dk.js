const cheerio = require('cheerio')
const mongoose = require('mongoose')
const rp = require('request-promise').defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true,
    resolveWithFullResponse: true
})

const { IP_SIKKA, PASS_SIKKA } = process.env
const mainUrl = 'http://approweb.intranet.pajak.go.id'
const loginUrl = 'http://approweb.intranet.pajak.go.id/index.php?r=site/index'
const db = mongoose.connection
const SP2DKKWL = require('../../models/sp2dkKwlModel')
const SP2DKKPP = require('../../models/sp2dkKppModel')
const SP2DKAR = require('../../models/sp2dkArModel')
const SP2DKWP = require('../../models/sp2dkWpModel')

const getDataAndImportSp2dk = (req, res) => {
    console.log('Menghapus Data SP2DK Terdahulu')
    db.dropCollection('SP2DKKWL')
    db.dropCollection('SP2DKKPP')
    db.dropCollection('SP2DKAR')
    db.dropCollection('SP2DKWP')

    const url = 'http://approweb.intranet.pajak.go.id/index.php?r=pengawasan/sp2dk'
    const { jnsTgl, bulan1, tahun1, bulan2, tahun2 } = req.body
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

    const getDataAndImportSp2dkWp = async (resp, kd_kpp, nip_ar) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('#sp2dkWp tr')
        for(let r = 1; r < rows.length - 1; r++){
            let cells = $($(rows[r]).find('td'))
            const d = { 'KD_KPP': kd_kpp, 'NIP_AR': nip_ar }
            for(let c = 1; c <= cells.length - 1; c++){
                const txt = $(cells[c]).text().trim()
                switch(c){
                    case 1: d['NPWP'] = txt.replace(/\.|\-/g, '')
                        break
                    case 2: d['NM_WP'] = txt
                        break
                    case 3: d['JML_SP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['JML_SP2DK_BLM_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['JML_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 6: d['JML_KEP_LHP2DK_SELESAI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 7: d['JML_KEP_LHP2DK_USULRIK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 8: d['JML_KEP_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 9: d['JML_KEP_LHP2DK_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 10: d['JML_KEP_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 11: d['NILAI_POTENSI_AWAL_BLM_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 12: d['NILAI_POTENSI_AWAL_SDH_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 13: d['NILAI_PERUBAHAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 14: d['NILAI_POTENSI_AKHIR_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 15: d['NILAI_POTENSI_AKHIR_LHP2DK_SELESAI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 16: d['NILAI_POTENSI_AKHIR_LHP2DK_USULRIK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 17: d['NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 18: d['NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 19: d['NILAI_POTENSI_AKHIR_LHP2DK_TA'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 20: d['NILAI_REALISASI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 21: d['NILAI_SALDO_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                }
            }
            data.push(d)
        }
        console.log(`Menambahkan Data SP2DK WP AR ${ nip_ar }...`)
        await SP2DKWP.insertMany(data).then(docs => {
            console.log(`${ docs.length } Data SP2DK WP AR ${ nip_ar } Ditambahkan...`)
        })
    }

    const getDataAndImportSp2dkAr = async (resp, kd_kpp) => {
        const data = []
        $ = cheerio.load(resp.body)
        let rows = $('#sp2dkAr tr')

        for(let r = 1; r < rows.length - 1; r++){
            let cells = $($(rows[r]).find('td'))
            const d = { 'KD_KPP': kd_kpp }
            for(let c = 1; c <= cells.length - 1; c++){
                const txt = $(cells[c]).text().trim()
                switch(c){
                    case 1: d['NIP_AR'] = txt.substring(1, 10), d['NM_AR'] = txt.substring(12)
                        break
                    case 2: d['JML_WP'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 3: d['JML_SP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 4: d['JML_SP2DK_BLM_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 5: d['JML_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 6: d['JML_KEP_LHP2DK_SELESAI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 7: d['JML_KEP_LHP2DK_USULRIK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 8: d['JML_KEP_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 9: d['JML_KEP_LHP2DK_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 10: d['JML_KEP_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 11: d['NILAI_POTENSI_AWAL_BLM_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 12: d['NILAI_POTENSI_AWAL_SDH_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 13: d['NILAI_PERUBAHAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 14: d['NILAI_POTENSI_AKHIR_LHP2DK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 15: d['NILAI_POTENSI_AKHIR_LHP2DK_SELESAI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 16: d['NILAI_POTENSI_AKHIR_LHP2DK_USULRIK'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 17: d['NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 18: d['NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 19: d['NILAI_POTENSI_AKHIR_LHP2DK_TA'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 20: d['NILAI_REALISASI'] = parseInt(txt.replace(/\,/g, ''))
                        break
                    case 21: d['NILAI_SALDO_DLMPENGAWASAN'] = parseInt(txt.replace(/\,/g, ''))
                        break
                }
            }
            data.push(d)
        }
        console.log(`Menambahkan Data SP2DK AR KPP ${ kd_kpp }...`)
        await SP2DKAR.insertMany(data).then(docs => {
            console.log(`${ docs.length } Data SP2DK AR KPP ${ kd_kpp } Ditambahkan...`)
        })

        for(let r = 3; r < rows.length - 1; r++){
            let nip_ar = $($(rows[r]).find('td')[1]).text().trim().substring(1,10)
            let link = $(rows[r]).find('a').attr('href')
            await rp.get(mainUrl + link).then(async resp => {
                await getDataAndImportSp2dkWp(resp, kd_kpp, nip_ar)
            })
        }
    }

    const getDataAndImportSp2dkKpp = async resp => {
        $ = cheerio.load(resp.body)
        const links = $('#sp2dkKpp a')
        for(let l = 0; l < links.length; l++){
            let kd_kpp = $(links[l]).text().trim().substring(1,4)
            await rp.get(mainUrl + $(links[l]).attr('href')).then(async resp => {
                $ = cheerio.load(resp.body)
                const link = $('#sp2dkWk a').attr('href')
                if(!!link) await rp.get(mainUrl + link).then(async resp => {
                    await getDataAndImportSp2dkAr(resp, kd_kpp)
                })
            })
        }

        const data = await SP2DKAR.aggregate([
            { 
                $group: {
                    _id: '$KD_KPP',
                    JML_WP: { $sum: '$JML_WP' },
                    JML_SP2DK: { $sum: '$JML_SP2DK' },
                    JML_SP2DK_BLM_LHP2DK: { $sum: '$JML_SP2DK_BLM_LHP2DK' },
                    JML_LHP2DK: { $sum: '$JML_LHP2DK' },
                    JML_KEP_LHP2DK_SELESAI: { $sum: '$JML_KEP_LHP2DK_SELESAI' },
                    JML_KEP_LHP2DK__USULRIK: { $sum: '$JML_KEP_LHP2DK__USULRIK' },
                    JML_KEP_LHP2DK_USULBUKPER: { $sum: '$JML_KEP_LHP2DK_USULBUKPER' },
                    JML_KEP_LHP2DK_DLMPENGAWASAN: { $sum: '$JML_KEP_LHP2DK_DLMPENGAWASAN' },
                    JML_KEP_LHP2DK_TA: { $sum: '$JML_KEP_LHP2DK_TA' },
                    NILAI_POTENSI_AWAL_BLM_LHP2DK: { $sum: '$NILAI_POTENSI_AWAL_BLM_LHP2DK' },
                    NILAI_POTENSI_AWAL_SDH_LHP2DK: { $sum: '$NILAI_POTENSI_AWAL_SDH_LHP2DK' },
                    NILAI_PERUBAHAN: { $sum: '$NILAI_PERUBAHAN' },
                    NILAI_POTENSI_AKHIR_LHP2DK: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK' },
                    NILAI_POTENSI_AKHIR_LHP2DK_SELESAI: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_SELESAI' },
                    NILAI_POTENSI_AKHIR_LHP2DK_USULRIK: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_USULRIK' },
                    NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER' },
                    NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN' },
                    NILAI_POTENSI_AKHIR_LHP2DK_TA: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_TA' },
                    NILAI_REALISASI: { $sum: '$NILAI_REALISASI' },
                    NILAI_SALDO_DLMPENGAWASAN: { $sum: '$NILAI_SALDO_DLMPENGAWASAN' },
                } 
            }
        ])
        for(let i in data){
            data[i] = { 
                ...data[i],
                KD_KPP: data[i]['_id'],
                KD_KWL: '090'
            }
            delete(data[i]['_id'])
        }
        await SP2DKKPP.insertMany(data).then(docs => {
            console.log(`${ docs.length } Data SP2DK KPP KANWIL 090 Ditambahkan...`)
        })
    }

    const getDataAndImportSp2dkKwl = async resp => {
        $ = cheerio.load(resp.body)
        let link = $('#sp2dkKwl a').attr('href')
        await rp.get(mainUrl + link).then(async resp => {
            await getDataAndImportSp2dkKpp(resp)
        })

        const data = await SP2DKKPP.aggregate([
            { 
                $group: {
                    _id: '$KD_KWL',
                    JML_WP: { $sum: '$JML_WP' },
                    JML_SP2DK: { $sum: '$JML_SP2DK' },
                    JML_SP2DK_BLM_LHP2DK: { $sum: '$JML_SP2DK_BLM_LHP2DK' },
                    JML_LHP2DK: { $sum: '$JML_LHP2DK' },
                    JML_KEP_LHP2DK_SELESAI: { $sum: '$JML_KEP_LHP2DK_SELESAI' },
                    JML_KEP_LHP2DK__USULRIK: { $sum: '$JML_KEP_LHP2DK__USULRIK' },
                    JML_KEP_LHP2DK_USULBUKPER: { $sum: '$JML_KEP_LHP2DK_USULBUKPER' },
                    JML_KEP_LHP2DK_DLMPENGAWASAN: { $sum: '$JML_KEP_LHP2DK_DLMPENGAWASAN' },
                    JML_KEP_LHP2DK_TA: { $sum: '$JML_KEP_LHP2DK_TA' },
                    NILAI_POTENSI_AWAL_BLM_LHP2DK: { $sum: '$NILAI_POTENSI_AWAL_BLM_LHP2DK' },
                    NILAI_POTENSI_AWAL_SDH_LHP2DK: { $sum: '$NILAI_POTENSI_AWAL_SDH_LHP2DK' },
                    NILAI_PERUBAHAN: { $sum: '$NILAI_PERUBAHAN' },
                    NILAI_POTENSI_AKHIR_LHP2DK: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK' },
                    NILAI_POTENSI_AKHIR_LHP2DK_SELESAI: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_SELESAI' },
                    NILAI_POTENSI_AKHIR_LHP2DK_USULRIK: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_USULRIK' },
                    NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER' },
                    NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN' },
                    NILAI_POTENSI_AKHIR_LHP2DK_TA: { $sum: '$NILAI_POTENSI_AKHIR_LHP2DK_TA' },
                    NILAI_REALISASI: { $sum: '$NILAI_REALISASI' },
                    NILAI_SALDO_DLMPENGAWASAN: { $sum: '$NILAI_SALDO_DLMPENGAWASAN' },
                } 
            }
        ])
        for(let i in data){
            data[i] = { 
                ...data[i],
                KD_KWL: data[i]['_id']
            }
            delete(data[i]['_id'])
        }
        await SP2DKKWL.insertMany(data).then(docs => {
            console.log(`${ docs.length } Data SP2DK KANWIL 090 Ditambahkan...`)
        })
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
            body: `apprCSRF=${ apprCSRF }&Sp2dkFormModel%5BjnsTgl%5D=${ jnsTgl }&Sp2dkFormModel%5Bbulan1%5D=${ bulan1 }&Sp2dkFormModel%5Btahun1%5D=${ tahun1 }&Sp2dkFormModel%5Bbulan2%5D=${ bulan2 }&Sp2dkFormModel%5Btahun2%5D=${ tahun2 }&Sp2dkFormModel%5Bseksi%5D=2`
        })
    }).then(async resp => {
        await getDataAndImportSp2dkKwl(resp)
        console.log('Data SP2DK Berhasil Disimpan...')
        res.json({ ok: true })
    }).catch(err => {
        console.log('Gagal Mengambil Data')
        res.json({ ok: false, err })
    })
}

module.exports = getDataAndImportSp2dk