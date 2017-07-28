
/*
	this class will control twitter interactions
*/

class TwitterBot {
	
	constructor( twit, lyricGenerator ) {
		this.twit = twit;
		this.lyricGenerator = lyricGenerator;
	}
	
	beginStatusPosts() {
		setInterval( () => {
			const lyric = ( Math.random() < 0.5 ) ? this.lyricGenerator.generateCompoundLyric() : this.lyricGenerator.generateCompoundLyricBraided();
			this.twit.post( 'statuses/update', { status: lyric }, ( err, data, response ) => {
				console.log( data );
			} );
		}, 1000 * 60 * 60 * 1 );
	}
	
	beginTaggedPostResponses() {
		
	}
}

module.exports = TwitterBot;