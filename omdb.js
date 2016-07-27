const omdb = new (require('omdb-api-client'))()

module.exports = function setupUrlSnatcher(client) {
	return function urlSnatcher(nick, to, text) {
		if(!/^\?[oi]mdb/.test(text)) return

		let args = text.trim().split(' ')
		if(args.length === 1) return

		omdb({t: args.splice(1).join(' ')}).list().then(function(movie) {
			let strb = []

			strb.push(movie.title)
			strb.push('(' + movie.year + ')')
			strb.push('«' + movie.genres.join(', ') + '»')
			strb.push('| ' + movie.directors.join(', '))

			client.say(to, strb.join(' '))
			client.say(to, movie.plot.substring(0, 250))
		}).catch(function(err) {
			client.say(to, 'Error retrieving movie information based on title from omdb.')
		});
	}
}