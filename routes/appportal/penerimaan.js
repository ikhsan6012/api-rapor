const cheerio = require('cheerio')
const mongoose = require('mongoose')
const csvjson = require('csvjson')
const rp = require('request-promise').defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true,
    resolveWithFullResponse: true
})

const { IP_SIKKA, PASS_SIKKA } = process.env
const mainUrl = 'https://appportal'
const ua = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36' }
const db = mongoose.connection
const MPN = require('../../models/mpnModel')
const SPM = require('../../models/spmModel')
const PBK = require('../../models/pbkModel')


const getDataAndImportPenerimaan = (req, res) => {
    let { type, valuta, kd_kpp, bulan1, bulan2, tahun } = req.body
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

    const getDataAndImportMpn = async () => {
        console.log('Menghapus Data MPN Harian Rekon Terdahulu...')
        db.dropCollection('MPN')

        for(t of tahun){
            for(k of kd_kpp){
                for(b of bulan){
                    for(v of valuta){
                        console.log(`Mengambil Data MPN Harian Rekon ${ k }${ t }4111000000131${ b }${ v }...`)
                        const url = mainUrl + `/portal/download/lsnfjkasbnfjnasjkfnjbnjnjknbkjnfjknbjkfnbkjfnbi3939489184.php?p1=${ k }${ t }4111000000131${ b }${ v }`
                        await rp.get(url).then(async resp => {
                            const data = []
                            const csv = csvjson.toObject(resp.body, {
                                delimiter: ',', quote: '"'
                            })
                            
                            for(let d of csv){
                                d['NPWP'] = d['NPWP'] + d['KPP'] + d['CAB']
                                d['KD_BANK'] = d['KD BANK']
                                d['PEMBUAT_BILLING'] = d['PEMBUAT BILLING']
                                delete d['KPP']
                                delete d['CAB']
                                delete d['KD BANK']
                                delete d['PEMBUAT BILLING']
                                data.push(d)
                            }
                
                            console.log(`Menambahkan Data MPN Harian Rekon ${ k }${ t }4111000000131${ b }${ v }...`)
                            await MPN.insertMany(data).then(docs => {
                                console.log(`${ docs.length } Data MPN Harian Rekon ${ k }${ t }4111000000131${ b }${ v } Ditambahkan...`)
                            })
                        })
                    }
                }
            }
        }
    }

    const getDataAndImportSpm = async () => {
        console.log('Menghapus Data SPM Terdahulu...')
        db.dropCollection('SPM')
        
        for(t of tahun){
            for(k of kd_kpp){
                for(b of bulan){
                    console.log(`Mengambil Data SPM ${ k }${ b }${ t }...`)
                    const url = mainUrl + `/portal/spm/dataspmcsv.php?p1=01&p2=31&p3=${ b }&p4=${ t }&p5=${ k }`
            
                    await rp.get(url).then(async resp => {
                        const data = []
                        const csv = csvjson.toObject(resp.body, {
                            delimiter: ',', quote: '"'
                        })
            
                        for(let d of csv){
                            const dt = {
                                NO_SPM: d['NO SPM'],
                                NPWP: d['NPWP'] + d['KPP'] + d['CABANG'],
                                NAMA_WP: d['NAMA WAJIB PAJAK'],
                                KPP: k,
                                KDMAP: d['KODE MAP'],
                                KJS: d['KODE BAYAR'],
                                MASA_PAJAK: d['MASA PAJAK'],
                                TGL_BAYAR: d['TANGGAL BAYAR'],
                                JUMLAH: d['JUMLAH BAYAR (Rp)'],
                                NTPN: d['NTPN'],
                                KD_BANK: d['KODE BANK'],
                                NOSKSSP: d['NO SK SSP']
                            }
                            data.push(dt)
                        }

                        console.log(`Menambahkan Data SPM ${ k }${ b }${ t }...`)
                        await SPM.insertMany(data).then(docs => {
                            console.log(`${ docs.length } Data SPM ${ k }${ b }${ t } Ditambahkan...`)
                        })
                    })
                }
            }
        }
	}
	
	const getDataAndImportPbk = async () => {
		console.log('Menghapus Data PBK Terdahulu...')
		db.dropCollection('PBK')

		for(let k of kd_kpp){
			for(let t of tahun){
				console.log(`Mengambil Data PBK ${ k }${ t }...`)
				const url = mainUrl + `/portal/pbk/hasil.php?pkpp=${ k }&ptahun=${ t }`
		
				await rp.get(url).then(async resp => {
					const $ = cheerio.load(resp.body)
					const rows = $('#tabhasil')
					const data = []
					
					for(let r = 0; r < rows.length; r++){
						const cells = $(rows[r]).find('td')
						const dt = {
							KPP: k,
							NOMOR_PBK:  $(cells[1]).text().trim(),
							TAHUN:  $(cells[2]).text().trim().substring(0, 4),
							TGL_DOKUMEN:  $(cells[2]).text().trim(),
							TGL_BERLAKU:  $(cells[3]).text().trim(),
							JUMLAH:  parseInt($(cells[4]).text().trim()),
							CURRENCY:  $(cells[5]).text().trim(),
							TIPE_PBK: $(cells[6]).text().trim(),
							NO_PROD_HUKUM: $(cells[24]).text().trim(),
							NTPN: $(cells[25]).text().trim(),
						}
		
						switch(dt['TIPE_PBK']){
							case 'MASA':
								dt['NPWP'] = $(cells[8]).text().trim() + $(cells[9]).text().trim() + $(cells[10]).text().trim()
								dt['NAMA_WP'] = $(cells[11]).text().trim()
								dt['KDMAP'] = $(cells[12]).text().trim()
								dt['KJS'] = $(cells[13]).text().trim()
								dt['MASA_PAJAK'] = $(cells[14]).text().trim()
								dt['TAHUN_PAJAK'] = $(cells[15]).text().trim()
								data.push(dt)
		
								dt['JUMLAH'] = -dt['JUMLAH']
								dt['NPWP'] = $(cells[16]).text().trim() + $(cells[17]).text().trim() + $(cells[18]).text().trim()
								dt['NAMA_WP'] = $(cells[19]).text().trim()
								dt['KDMAP'] = $(cells[20]).text().trim()
								dt['KJS'] = $(cells[21]).text().trim()
								dt['MASA_PAJAK'] = $(cells[22]).text().trim()
								dt['TAHUN_PAJAK'] = $(cells[23]).text().trim()
								data.push(dt)
								break
							case 'KIRIM':
								if(!!$(cells[1]).text().trim().match(/WPJ\.05/)){
									dt['JUMLAH'] = -dt['JUMLAH']
									dt['NPWP'] = $(cells[8]).text().trim() + $(cells[9]).text().trim() + $(cells[10]).text().trim()
									dt['NAMA_WP'] = $(cells[11]).text().trim()
									dt['KDMAP'] = $(cells[12]).text().trim()
									dt['KJS'] = $(cells[13]).text().trim()
									dt['MASA_PAJAK'] = $(cells[14]).text().trim()
									dt['TAHUN_PAJAK'] = $(cells[15]).text().trim()
									data.push(dt)
									
									const urlSearch = mainUrl + '/portal/masterfile/hasil.php'
									const resp = await rp.post(urlSearch, {
										headers: { ...ua },
										form: { input: $(cells[16]).text().trim(), kriteria1: 1, kriteria2: 1 }
									})
									const $2 = cheerio.load(resp.body)
									const rows2 = $2('table tr')
									
									for(let r2 = 1; r2 < rows2.length; r2++){
										if(!($(cells[16]).text().trim() == '000000000')){
											const npwp = $2($2(rows2[r2]).find('td')[1]).text().trim()
											const kpp = $2($2(rows2[r2]).find('td')[10]).text().trim().substring(0, 3)
											if((npwp == $(cells[16]).text().trim() + '-' + $(cells[17]).text().trim() + '.' + $(cells[18]).text().trim()) && !!(kd_kpp.includes(kpp))){
												dt['JUMLAH'] = dt['JUMLAH']
												dt['NPWP'] = $(cells[16]).text().trim() + $(cells[17]).text().trim() + $(cells[18]).text().trim()
												dt['NAMA_WP'] = $(cells[19]).text().trim()
												dt['KDMAP'] = $(cells[20]).text().trim()
												dt['KJS'] = $(cells[21]).text().trim()
												dt['MASA_PAJAK'] = $(cells[22]).text().trim()
												dt['TAHUN_PAJAK'] = $(cells[23]).text().trim()
												data.push(dt)
											}
										}
									}
								} else {
									dt['JUMLAH'] = dt['JUMLAH']
									dt['NPWP'] = $(cells[16]).text().trim() + $(cells[17]).text().trim() + $(cells[18]).text().trim()
									dt['NAMA_WP'] = $(cells[19]).text().trim()
									dt['KDMAP'] = $(cells[20]).text().trim()
									dt['KJS'] = $(cells[21]).text().trim()
									dt['MASA_PAJAK'] = $(cells[22]).text().trim()
									dt['TAHUN_PAJAK'] = $(cells[23]).text().trim()
									data.push(dt)
								}
								break
						}
					}
					console.log(`Menambahkan Data PBK ${ k }${ t }...`)
					await PBK.insertMany(data).then(docs => {
						console.log(`${ docs.length } Data PBK ${ k }${ t } Ditambahkan...`)
					})
				})
			}
		}
	}
    
    rp.post(mainUrl + '/login/login/loging_simpel',{
        headers: { ...ua },
        form: { username: IP_SIKKA, password: PASS_SIKKA, sublogin: 'Login' }
    }).then(async resp => {
        if(!!type.find(t => t === 'mpn')) {
            await getDataAndImportMpn()
            console.log('Data MPN Harian Rekon Berhasil Diimport...')
        }

        if(!!type.find(t => t === 'spm')){
            await getDataAndImportSpm()
            console.log('Data SPM Berhasil Diimport...')
		}

		if(!!type.find(t => t === 'pbk')){
            await getDataAndImportPbk()
            console.log('Data PBK Berhasil Diimport...')
		}
		
		res.json({ ok: true })
    })
}

module.exports = getDataAndImportPenerimaan