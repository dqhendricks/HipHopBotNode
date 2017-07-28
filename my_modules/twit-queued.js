const Twit = require( 'twit' );

/*
	this class will process twitter API calls in a queue in order to avoid rate limiting
*/

class TwitQueued {
	
	constructor( twitterCredentials ) {
		this.twit = new Twit( twitterCredentials );
		this.queue = [];
		
		setInterval( () => {
			this.processQueue();
		}, 1000 * 60 ); // rate limit is one per minute
	}
	
	processQueue() {
		if ( this.queue.length > 0 ) {
			const request = this.queue.shift();
			this.twit[request.method]( request.endPoint, request.parameters, request.callback );
		}
	}
	
	get( endPoint, parameters, callback ) {
		this.queue.push( {
			method: 'get',
			endPoint,
			parameters,
			callback
		} );
	}
	
	post( endPoint, parameters, callback ) {
		this.queue.push( {
			method: 'post',
			endPoint,
			parameters,
			callback
		} );
	}
}

module.exports = TwitQueued;