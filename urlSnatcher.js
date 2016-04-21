'use strict'

const fs = require('fs')
const dateFormat = require('dateformat')
const request = require('request')
const cheerio = require('cheerio')

module.exports = function setupUrlSnatcher(client) {
	// urls is a tab separated file
	// nick\ttimestamp\turl
	let urlFile = fs.readFileSync('./urls.txt', 'utf8')

	let urls = [];

	urlFile.split('\n').forEach(line => {
		let splitLine = line.split('\t')
		urls.push({
			nick: splitLine[0],
			timestamp: splitLine[1],
			url: splitLine[2]
		})
	})

	let extractUrls = text => text.match(/https?:\/\/[^\s]+/g) || []

	let formatUrl = url => {
		let time = new Date(parseInt(url.timestamp))
		return url.nick + ' (' + dateFormat(time, 'dd.mm.yy') +'): ' + url.url
	}

	let commands = {
		last: function(nick, to, args, text) {
			if(args.length === 3) {
				var i = urls.length - 1

				while(--i) {
					let url = urls[i]
					if(url.nick === args[2]) {
						client.say(to, formatUrl(url))
						return
					}
				}
				client.say(to, args[2] + ' have not posted any URLs.')
				return
			}
			let url = urls[urls.length - 1]
			client.say(to, formatUrl(url))
		},

		source: function(nick, to, args, text) {
			if(args.length === 2) {
				client.say(nick, 'Usage: "?url source youtube" will' +
				                 'give you all youtube urls')
				return
			}
			let foundUrls = 0
			for(let i = urls.length - 1; i >= 0; i--) {
				let url = urls[i];

				let domain = url.url.match(/https?:\/\/([^\s\/]+)/)[1]

				if(domain.indexOf(args[2]) > -1) {
					foundUrls++
					client.say(nick, formatUrl(url))
				}

				if(foundUrls === 5) {
					return
				}
			}
			
			if(foundUrls === 0) {
				client.say(nick, 'Found no urls with source "' + args[2] + '"')
			}
		}
	}

	return function urlSnatcher(nick, to, text) {
		if(/^\?url/.test(text)) {
			let args = text.trim().split(' ')

			if(args.length === 1) {
				var cs = []
				for(let command in commands)
					cs.push(command)
				
				client.say(nick, 'Available ?url commands: ' + cs.join(', '))
				return
			}


			let command = commands[args[1]]

			if(command) command(nick, to, args, text)

			return;
		}

		let lastUrl
		extractUrls(text).forEach(url => {
			lastUrl = url
			urls.push({
				nick,
				timestamp: new Date().getTime(),
				url
			})
		})
		if(lastUrl === undefined) return
		let urlFile = urls.map(url => {
			return url.nick + '\t' + url.timestamp + '\t' + url.url
		}).join('\n')

		fs.writeFileSync('./urls.txt', urlFile, 'utf8')


		request(lastUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				let $ = cheerio.load(body)
				let title = $('title')
				               .text()
				               .substring(0, 400) // Dont overflow
				               .replace(/\s+/g, ' ') // Keep whitespace simple
				if(title) {
					client.say(to, title)
				}
			}
		})
	}
}