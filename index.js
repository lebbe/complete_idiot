'use strict'

const fml = require('random_fml')
const irc = require('irc')

let client = new irc.Client('irc.homelien.no', 'thorstone', {
	channels: ['#complete_idiots']
})

const urlSnatcher = require('./urlSnatcher.js')(client)

client.addListener('message', function (from, to, message) {

	if(/^\?fml/.test(message)) {
		fml().then(fml => client.say(to, fml))
		return
	}

	urlSnatcher(from, to, message)
})
