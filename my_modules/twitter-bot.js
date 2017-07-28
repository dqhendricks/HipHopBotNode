
/*
	this class will control twitter interactions
*/

class TwitterBot {
	
	constructor( twit, lyricGenerator ) {
		this.twit = twit;
		this.lyricGenerator = lyricGenerator;
	}
	
	beginStatusPosts() {
		this.postStatus();
		setInterval( () => {
			this.postStatus();
		}, 1000 * 60 * 60 * 0.5 );
	}
	
	postStatus() {
		this.twit.post( 'statuses/update', { status: this.lyricGenerator.generateCompoundLyric() }, ( err, data, response ) => {
			console.log( data );
		} );
	}
	
	beginTaggedPostResponses() {
		var stream = this.twit.stream( 'statuses/filter', { track: '@the_lyric_bot' } )
 
		stream.on( 'tweet', status => {
			if ( status.user.screen_name != 'the_lyric_bot' && this.twit.queueLength() < 500 ) {
				var rhymeWord = this.extractRhymeWordFromStatus( status.text );
				var replyText;
				if ( !rhymeWord ) {
					replyText = 'Sorry, you sent me too many words. Try just one.';
				} else {
					replyText = this.lyricGenerator.generateCompoundLyric( 139, rhymeWord );
				}
				this.twit.post( 'statuses/update', {
					status: `@${ status.user.screen_name } ${ replyText }`,
					in_reply_to_status_id: status.id_str
				}, ( err, data, response ) => {
					console.log( data );
				} );
			}
		} );
	}
	
	extractRhymeWordFromStatus( statusText ) {
		statusText = statusText.replace( /@the_lyric_bot /g, '' ).trim().split( ' ' );
		if ( statusText.length == 1 ) {
			return statusText[0].toLowerCase();
		} else {
			return null;
		}
	}
}

module.exports = TwitterBot;