'use strict'

const fml = require('random_fml')
const irc = require('irc')
const weather = require('weather-js')
const insult = require('shakespeare-insult')

let client = new irc.Client('irc.homelien.no', 'thorstone', {
	channels: ['#complete_idiots']
})

const urlSnatcher = require('./urlSnatcher.js')(client)

client.addListener('message', function (from, to, message) {
  let args = message.trim().split(/\s/)

	if(/^\?fml/.test(message)) {
		fml().then(fml => client.say(to, fml))
		return
	}

	if(/^\?w /.test(message)) {
		let search = message.split(' ').splice(1).join(' ').trim()

		if(!search) return

		weather.find({search, degreeType: 'C'}, function(err, result) {
  			if(err) {
  				console.log(err)
  				client.say(to, 'Error finding weather information about ' + search + '.')
  				return
  			}

  			let info = []
  			let current = result[0].current

  			info.push(current.observationpoint + ': ')
  			info.push(current.temperature + 'C, ')
  			info.push(current.skytext + ', ')
  			info.push('humidity: ' + current.humidity + ', ')
  			info.push('windspeed: ' + current.windspeed)

  			client.say(to, info.join(''))
        return
		});

    if(/^\?insult/.test(message)) {
      let nick = args.length === 2 ? args[1] : from
      client.say(to, nick + ': You ' + insult.random() + '.')
      return
    }
		return
	}

	urlSnatcher(from, to, message)
}).addListener('error', function(message) {
    console.log('error: ', message)
})