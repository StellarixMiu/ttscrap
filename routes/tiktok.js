const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

router.get('/d', async (req, res, next) => {
	if(!req.query.link){
		const err = new Error("Required website missing")
		err.status = 400
		next(err)
	}

	try {
		const browser = await puppeteer.launch({
			headless:true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
			  ],
		})
		const page = await browser.newPage()

		await page.goto('https://tik-tok-video.com/id/')

		await page.type(".search", req.query.link)
		await Promise.all([await page.click('[class="form-button-description"]'), await page.waitForSelector('div.result__wrapper')])

		const data = await page.evaluate(() => {
			const list = []
			const items = document.querySelectorAll("div.result__wrapper")

			for ( const item of items) {
				list.push({
					title: item.querySelector(' .result__nick ').textContent,
					desc: item.querySelector(' .result__text ').textContent,
					vid: item.querySelector(' button:nth-child(3) > a ').href,
					mp3: item.querySelector(' button.result__btn_alt.result__btn > a ').href,
				})
			}
			return list
		})

		await page.close()
		await browser.close()
		return res.status(200).send(data)

	} catch (err) {
		console.log(err)
		res.status(500).send("Internal server error")
	}
})

router.get('/p', async  (req, res, next) => {

	if(!req.query.user){
		const err = new Error("Required Username Missing")
		err.status = 400
		next(err)
	}
	try {		
		const url = `https://www.tiktok.com/@` + req.query.user

		const browser = await puppeteer.launch({
			headless:true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
			  ],
		})

		const page = await browser.newPage()
		await page.goto(url)

		const profileData = await page.evaluate(() => {
			const profile = []
			const profileDatas = document.querySelectorAll(" div.tiktok-w4ewjk-DivShareLayoutV2.elmjn4l0 > div ")

			for ( const profileData of profileDatas) {
				profile.push({
					title: profileData.querySelector(' div.tiktok-1hdrv89-DivShareTitleContainer.ekmpd5l3 > h2 ').textContent,
					subTitle: profileData.querySelector(' div.tiktok-1hdrv89-DivShareTitleContainer.ekmpd5l3 > h1 ').textContent,
					following: profileData.querySelector(' h2.tiktok-7k173h-H2CountInfos.e1457k4r0 > div:nth-child(1) > strong ').textContent,
					follower: profileData.querySelector(' h2.tiktok-7k173h-H2CountInfos.e1457k4r0 > div:nth-child(2) > strong ').textContent,
					likes: profileData.querySelector(' h2.tiktok-7k173h-H2CountInfos.e1457k4r0 > div:nth-child(3) > strong ').textContent,
					desc: profileData.querySelector(' h2.tiktok-b1wpe9-H2ShareDesc.e1457k4r3 ').textContent,
				})
			}
			return profile
		})

		await page.close()
		await browser.close()
		return res.status(200).send(profileData)

	} catch (err) {
		console.log(err)
		res.status(500).send("Internal server error")
	}

})


module.exports = router