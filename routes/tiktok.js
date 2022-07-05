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

		const preparePageForTests = async (page) => {

			// Pass the User-Agent Test.
			const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
			await page.setUserAgent(userAgent);
			}

		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
			  ],
			headless: true,
		})
		const page = await browser.newPage()
		await preparePageForTests(page);
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

		const preparePageForTests = async (page) => {

			// Pass the User-Agent Test.
			const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36'
			await page.setUserAgent(userAgent)
			}

		const url = `https://www.tiktok.com/@` + req.query.user

		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
			  ],
			headless: true,
		})

		const page = await browser.newPage()
		await preparePageForTests(page)
		await page.goto(url)

		await autoScroll(page)
		
		async function autoScroll(page){
			await page.evaluate(async () => {
				await new Promise((resolve, reject) => {
					let totalHeight = 0;
					let distance = 100;
					let timer = setInterval(() => {
						let scrollHeight = document.body.scrollHeight;
						window.scrollBy(0, distance);
						totalHeight += distance;
						
						if(totalHeight >= scrollHeight){
							clearInterval(timer);
							resolve();
						}
					}, 100);
				});
			});
			}
			
			const profileHandles = await page.$$( 'div.tiktok-1g04lal-DivShareLayoutHeader-StyledDivShareLayoutHeaderV2' )
			const videoHandles = await page.$$( 'div.tiktok-x6y88p-DivItemContainerV2' )
	
			let profile = []
			let videos = []

		for(const profilehandle of profileHandles) {
			let userTitle ="Null"
			let userSubtitle ="Null"
			let userFollowing ="Null"
			let userFollowers ="Null"
			let userLikes ="Null"
			let userBio ="Null"

			try {
				userTitle = await page.evaluate(el => el.querySelector(' h2.tiktok-b7g450-H2ShareTitle ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			try {
				userSubtitle = await page.evaluate(el => el.querySelector(' h1.tiktok-qpyus6-H1ShareSubTitle ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			try {
				userFollowing = await page.evaluate(el => el.querySelector(' div:nth-child(1) > strong ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			try {
				userFollowers = await page.evaluate(el => el.querySelector(' div:nth-child(2) > strong ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			try {
				userLikes = await page.evaluate(el => el.querySelector(' div:nth-child(3) > strong ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			try {
				userBio = await page.evaluate(el => el.querySelector(' h2.tiktok-b1wpe9-H2ShareDesc ').textContent, profilehandle)
			} catch (error) {
				console.log(error)
			}

			profile.push({
				userTitle,
				userSubtitle,
				userFollowing,
				userFollowers,
				userLikes,
				userBio
			})

		}

		for (const videoHandle of videoHandles) {
			let videoUrl = "Null"
			let videoViews = "Null"
			let videoTitle = "Null"

			try {
				videoUrl = await page.evaluate(el => el.querySelector(' div > div > a ').href, videoHandle)
			} catch (error) {
				console.log(error)
			}

			try {
				videoViews = await page.evaluate(el => el.querySelector(' strong ').textContent, videoHandle)
			} catch (error) {
				console.log(error)
			}

			try {
				videoTitle = await page.evaluate(el => el.querySelector(' a.tiktok-1wrhn5c-AMetaCaptionLine ').getAttribute("title"), videoHandle)
				if(videoTitle === null){
					videoTitle = "No caption found"
				}else{
					videoTitle.innerHTML
				}
			} catch (error) {
				console.log(error)
			}

			videos.push({
				videoUrl,
				videoViews,
				videoTitle
			})
		}
		
		Array.prototype.push.apply(profile, videos)

		await page.close()
		await browser.close()
		res.status(200).json(profile)
	} catch (err) {
		console.log(err)
		res.status(500).send("Internal server error")
	}

})


module.exports = router