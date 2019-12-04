const puppeteer = require('puppeteer')
const mongoose = require('mongoose')

const { IP_SIKKA, PASS_SIDJP } = process.env
const mainUrl = 'http://sidjp:7777/SIDJP'
const loginUrl = mainUrl + '/sipt_web.showlogin'
const db = mongoose.connection

const getMfwp = async () => {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: false,
        defaultViewport: null
    })
    const page = await browser.newPage()

    // Login SIDJP
    await page.goto(loginUrl, { waitUntil: 'networkidle0' })
    await page.type('.isian[type="text"]', IP_SIKKA)
    await page.type('.isian[type="password"]', PASS_SIDJP)
    await page.click('.tombol')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Goto INFOMONITORMENU_V2
    await page.goto(mainUrl + '/INFOMONITORMENU_V2', { waitUntil: 'networkidle0' })
    
    // Open Form
    await page.click('.i_male_contour>a')
    await page.waitFor(200)
    await page.click('[disp="pkg_mon_wp_js.mon_ar_wp"]')
    await page.waitFor(500)

    // Fill Form
    let captcha = await page.$eval('#image_captcha', e => e.innerHTML)
    await page.$eval('#pkpp', e => e.value = '031')
    await page.$eval('#ppk', e => e.value = '67')
    await page.click('#cari_profil')
    await page.waitFor(1000)

    // Bypass Captcha
    if(await page.$eval('#image_captcha', e => e.innerHTML) !== captcha){
        const captchaString = await page.$eval('#image_captcha>img', e => e.getAttribute('href'))
        
    }
}

module.exports = getMfwp