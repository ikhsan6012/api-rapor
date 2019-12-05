const DIMKANTOR = require('../../models/dimKantor')
const DIMAR = require('../../models/dimAr')
const SP2DKAR = require('../../models/sp2dkArModel')
const SP2DKWP = require('../../models/sp2dkWpModel')
const STPAR = require('../../models/stpArModel')
const NONGALPOTAR = require('../../models/nonGalpotArModel')

const dateFromObjectId = objectId => {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

const quartile = (arr, q) => {
  arr = arr.slice().sort((a, b) => a - b)
  var pos = ((arr.length) - 1) * q
  var base = Math.floor(pos)
  var rest = pos - base
  if( (arr[base + 1] !== undefined) ) {
    return arr[base] + rest * (arr[base + 1] - arr[base]);
  } else {
    return arr[base];
  }
}

const getXmax = arr => {
  const q1 = quartile(arr, .25)
  const q3 = quartile(arr, .5)
  const iqr = q3 - q1
  const sep = q3 + (1.5 * iqr)

  arr = arr.filter(a => a <= sep)
  return Math.max(...arr)
}

const hitungSkor = (a, b, x, xmax, xmin) => {
  const skor = (a-b) * (x-xmin) / (xmax-xmin) + 1
  return skor <= 100 ? skor : 100
}

const ranking = arr => {
  const sorted = arr.slice().sort((a, b) => b - a)
  const ranks = arr.slice().map(v => sorted.indexOf(v) + 1 )
  return ranks
}

const getRapor = async (req, res) => {
  const { KD_KPP } = req.body
  
  const q = KD_KPP ? { KD_KPP } : {}
  const list_ar = await DIMAR.find(q, 'NIP_AR NAMA_AR KD_KPP')
  let lastUpdate = await SP2DKAR.findOne().sort({ updatedAt: 1 })
  lastUpdate = lastUpdate.updatedAt

  const data = {}
  const jmlSp2dkArr = []
  const jmlLhp2dkArr = []
  const jmlLhp2dkBerkualitasArr = []
  const nilaiPotensiAkhirArr = []
  const realisasiPotensiJmlWpArr = []
  const realisasiPotensiNilaiArr = []
  const jmlStpArr = []
  const nilaiStpArr = []
  const jmlNonGalpotArr = []
  const jmlVisitArr = []
  
  for(let ar of list_ar){
    const SP2DK = await SP2DKAR.findOne({ NIP_AR: ar.NIP_AR })
    const NONGALPOT = await NONGALPOTAR.findOne({ NIP_AR: ar.NIP_AR })
    const LHP2DK_BERKUALITAS = await SP2DKWP.countDocuments({ 
      NIP_AR: ar.NIP_AR,
      NILAI_POTENSI_AKHIR_LHP2DK: { $gte: 50000 }
    })
    const POTENSI_AKHIR = SP2DK.NILAI_POTENSI_AKHIR_LHP2DK_USULRIK + SP2DK.NILAI_POTENSI_AKHIR_LHP2DK_USULBUKPER + SP2DK.NILAI_POTENSI_AKHIR_LHP2DK_DLMPENGAWASAN
    const REALISASI_POTENSI = {
      JML_WP: await SP2DKWP.countDocuments({ NIP_AR: ar.NIP_AR, NILAI_REALISASI: { $gt: 0 } }),
      NILAI_REALISASI: SP2DK.NILAI_REALISASI
    }
    const STP = await STPAR.findOne({ NIP_AR: ar.NIP_AR }, '-_id JML_STP NILAI_IDR')
    const NON_GALPOT = NONGALPOT.KONSULTASI + NONGALPOT.KORESPONDENSI + NONGALPOT.AKTIVITAS_LAINNYA
    const VISIT = NONGALPOT.KUNJUNGAN_AR

    jmlSp2dkArr.push(SP2DK.JML_WP)
    jmlLhp2dkArr.push(SP2DK.JML_LHP2DK)
    jmlLhp2dkBerkualitasArr.push(LHP2DK_BERKUALITAS)
    nilaiPotensiAkhirArr.push(POTENSI_AKHIR)
    realisasiPotensiJmlWpArr.push(REALISASI_POTENSI.JML_WP)
    realisasiPotensiNilaiArr.push(REALISASI_POTENSI.NILAI_REALISASI)
    jmlStpArr.push(STP.JML_STP)
    nilaiStpArr.push(STP.NILAI_IDR)
    jmlNonGalpotArr.push(NON_GALPOT)
    jmlVisitArr.push(VISIT)
    
    data[ar.NIP_AR] = {
      NAMA_AR: ar.NAMA_AR,
      KPP: await DIMKANTOR.findOne({ KD_KANTOR: ar.KD_KPP }, '-_id KD_KANTOR NM_KANTOR'),
      SP2DK: SP2DK.JML_WP,
      LHP2DK: SP2DK.JML_LHP2DK,
      LHP2DK_BERKUALITAS,
      POTENSI_AKHIR,
      REALISASI_POTENSI,
      STP,
      NON_GALPOT,
      VISIT
    }
  }

  const a = 100
  const b = 1

  const xMinJmlSp2dk = 1
  const xMaxJmlSp2dk = getXmax(jmlSp2dkArr)
  const xMinJmlLhp2dk = 1
  const xMaxJmlLhp2dk = getXmax(jmlLhp2dkArr)
  const xMinJmlLhp2dkBerkualitas = 1
  const xMaxJmlLhp2dkBerkualitas = getXmax(jmlLhp2dkBerkualitasArr)
  const xMinNilaiPotensiAkhir = 500000
  const xMaxNilaiPotensiAkhir = getXmax(nilaiPotensiAkhirArr)
  const xMinRealisasiPotensiJmlWp = 1
  const xMaxRealisasiPotensiJmlWp = getXmax(realisasiPotensiJmlWpArr)
  const xMinRealisasiPotensiNilai = 100000
  const xMaxRealisasiPotensiNilai = getXmax(realisasiPotensiNilaiArr)
  const xMinJmlStp = 1
  const xMaxJmlStp = getXmax(jmlStpArr)
  const xMinNilaiStp = 100000
  const xMaxNilaiStp = getXmax(nilaiStpArr)
  const xMinjmlNonGalpot = 1
  const xMaxjmlNonGalpot = getXmax(jmlNonGalpotArr)
  const xMinjmlVisit = 1
  const xMaxjmlVisit = getXmax(jmlVisitArr)

  const totalSkorAkhirArr = []
  for(let d of Object.keys(data)){
    data[d] = {
      ...data[d],
      SP2DK: {
        JUMLAH: data[d].SP2DK,
        SKOR: hitungSkor(a, b, data[d].SP2DK, xMaxJmlSp2dk, xMinJmlSp2dk),
        SKOR_AKHIR: hitungSkor(a, b, data[d].SP2DK, xMaxJmlSp2dk, xMinJmlSp2dk) * 10/100,
      },
      LHP2DK: {
        JUMLAH: data[d].LHP2DK,
        SKOR: hitungSkor(a, b, data[d].LHP2DK, xMaxJmlLhp2dk, xMinJmlLhp2dk),
        SKOR_AKHIR: hitungSkor(a, b, data[d].LHP2DK, xMaxJmlLhp2dk, xMinJmlLhp2dk) * 5/100,
      },
      LHP2DK_BERKUALITAS: {
        JUMLAH: data[d].LHP2DK_BERKUALITAS,
        SKOR: hitungSkor(a, b, data[d].LHP2DK_BERKUALITAS, xMaxJmlLhp2dkBerkualitas, xMinJmlLhp2dkBerkualitas),
        SKOR_AKHIR: hitungSkor(a, b, data[d].LHP2DK_BERKUALITAS, xMaxJmlLhp2dkBerkualitas, xMinJmlLhp2dkBerkualitas) * 15/100,
      },
      POTENSI_AKHIR: {
        NILAI: data[d].POTENSI_AKHIR,
        SKOR: hitungSkor(a, b, data[d].POTENSI_AKHIR, xMaxNilaiPotensiAkhir, xMinNilaiPotensiAkhir),
        SKOR_AKHIR: hitungSkor(a, b, data[d].POTENSI_AKHIR, xMaxNilaiPotensiAkhir, xMinNilaiPotensiAkhir) * 15/100,
      },
      REALISASI_POTENSI: {
        WP: {
          JUMLAH: data[d].REALISASI_POTENSI.JML_WP,
          SKOR: hitungSkor(a, b, data[d].REALISASI_POTENSI.JML_WP, xMaxRealisasiPotensiJmlWp, xMinRealisasiPotensiJmlWp),
          SKOR_AKHIR: hitungSkor(a, b, data[d].REALISASI_POTENSI.JML_WP, xMaxRealisasiPotensiJmlWp, xMinRealisasiPotensiJmlWp) * 25/100 * 30/100,
        },
        REALISASI: {
          NILAI: data[d].REALISASI_POTENSI.NILAI_REALISASI,
          SKOR: hitungSkor(a, b, data[d].REALISASI_POTENSI.NILAI_REALISASI, xMaxRealisasiPotensiNilai, xMinRealisasiPotensiNilai),
          SKOR_AKHIR: hitungSkor(a, b, data[d].REALISASI_POTENSI.NILAI_REALISASI, xMaxRealisasiPotensiNilai, xMinRealisasiPotensiNilai) * 25/100 * 70/100,
        },
      },
      STP: {
        JUMLAH: {
          JUMLAH: data[d].STP.JML_STP,
          SKOR: hitungSkor(a, b, data[d].STP.JML_STP, xMaxJmlStp, xMinJmlStp),
          SKOR_AKHIR: hitungSkor(a, b, data[d].STP.JML_STP, xMaxJmlStp, xMinJmlStp) * 20/100 * 30/100,
        },
        NILAI: {
          NILAI: data[d].STP.NILAI_IDR,
          SKOR: hitungSkor(a, b, data[d].STP.NILAI_IDR, xMaxNilaiStp, xMinNilaiStp),
          SKOR_AKHIR: hitungSkor(a, b, data[d].STP.NILAI_IDR, xMaxNilaiStp, xMinNilaiStp) * 20/100 * 70/100,
        },
      },
      NON_GALPOT: {
        JUMLAH: data[d].NON_GALPOT,
        SKOR: hitungSkor(a, b, data[d].NON_GALPOT, xMaxjmlNonGalpot, xMinjmlNonGalpot),
        SKOR_AKHIR: hitungSkor(a, b, data[d].NON_GALPOT, xMaxjmlNonGalpot, xMinjmlNonGalpot) * 5/100,
      },
      VISIT: {
        JUMLAH: data[d].VISIT,
        SKOR: hitungSkor(a, b, data[d].VISIT, xMaxjmlVisit, xMinjmlVisit),
        SKOR_AKHIR: hitungSkor(a, b, data[d].VISIT, xMaxjmlVisit, xMinjmlVisit) * 5/100,
      },
    }
    
    data[d].TOTAL_SKOR_AKHIR =
      data[d].SP2DK.SKOR_AKHIR +
      data[d].LHP2DK.SKOR_AKHIR +
      data[d].LHP2DK_BERKUALITAS.SKOR_AKHIR +
      data[d].POTENSI_AKHIR.SKOR_AKHIR +
      data[d].REALISASI_POTENSI.WP.SKOR_AKHIR +
      data[d].REALISASI_POTENSI.REALISASI.SKOR_AKHIR +
      data[d].STP.JUMLAH.SKOR_AKHIR +
      data[d].STP.NILAI.SKOR_AKHIR +
      data[d].NON_GALPOT.SKOR_AKHIR +
      data[d].VISIT.SKOR_AKHIR

    totalSkorAkhirArr.push(data[d].TOTAL_SKOR_AKHIR)
  }
  const ranks = ranking(totalSkorAkhirArr)

  for(let i = 0; i < Object.keys(data).length; i++){
    const d = Object.keys(data)[i]
    data[d].RANKING = ranks[i]
  }

  res.json({ ok: true, data, lastUpdate })
}

module.exports = getRapor