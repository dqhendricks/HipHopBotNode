const fs = require( 'fs' );
const _ = require( 'lodash' );
const syllable = require( 'syllable' );
const rhymes = require( './rhymes-improved' );

/*
	this class will deconstruct training text, then use the data to generate random lyrics using reverse markov chains, a rhyme dictionary, and syllable counting
*/

class LyricGenerator {
	
	constructor() {
		this.initializeData();
		this.badTrailingElements = [
			'and',
			'a',
			'an',
			'the',
			'but',
			'which',
			'my',
			'of',
			'its',
			'it\'s',
			'or',
			'whether',
			'i\'m',
			'i\'d',
			'you\'re',
			'your',
			'we\'ll'
		];
	}
	
	initializeData() {
		this.data = {};
	}
	
	trainFromFile( filePath ) {
		this.trainFromText( fs.readFileSync( filePath, 'utf8' ) );
	}
	
	trainFromText( text ) {
		text = text.toLowerCase().replace( /\?|:|!/g, '.' ).replace( /,|;|"|\(|\)|\[.*?\]/g, '' );
		
		const verses = text.split( '"\r\n"' );
		
		verses.forEach( verse => {
			
			const textSentences = verse.replace( /\s+/g, ' ' ).split( '.' );
			
			textSentences.forEach( sentence => {
				sentence = sentence.trim();
				const words = sentence.split( ' ' );
				
				this.processWordArray( words );
			} );
		} );
	}
	
	processWordArray( words ) {
		for ( var i = words.length - 1; i > 1; i-- ) {
			const key = `${ words[i - 1] } ${ words[i] }`;
			const value1 = words[i - 2];
			
			if ( !( key in this.data ) ) this.data[key] = {};
			this.data[key][value1] = true;
			if ( i > 2 ) {
				const value2 = `${ words[i - 3] } ${ words[i - 2] }`;
				this.data[key][value2] = true;
			}
		}
	}
	
	generateSimpleLyric( characterLimit = 140, rhymeWith = null ) {
		var lyricPair = this.generateLyricPair( characterLimit - 2, rhymeWith );
		if ( !lyricPair ) return 'Sorry, but that word doesn\'t really inspire me.';
		
		const lowestSyllables = this.getLowestSyllables( lyricPair.firstHalf, lyricPair.secondHalf );
		lyricPair = this.formatLyricPair( this.limitSyllablesLyricPair( lyricPair, lowestSyllables ) );
		
		return `${ lyricPair.firstHalf }\r\n${ lyricPair.secondHalf }`;
	}
	
	generateCompoundLyric( characterLimit = 140, rhymeWith = null ) {
		const pairLimit = Math.floor( ( characterLimit - 6 ) / 2 );
		var lyricPair1 = this.generateLyricPair( pairLimit, rhymeWith );
		if ( !lyricPair1 ) return 'Sorry, but that word doesn\'t really inspire me';
		var lyricPair2 = this.generateLyricPair( pairLimit );
		
		const lowestSyllables = this.getLowestSyllables( lyricPair1.firstHalf, lyricPair1.secondHalf, lyricPair2.firstHalf, lyricPair2.secondHalf );
		lyricPair1 = this.formatLyricPair( this.limitSyllablesLyricPair( lyricPair1, lowestSyllables ) );
		lyricPair2 = this.formatLyricPair( this.limitSyllablesLyricPair( lyricPair2, lowestSyllables ) );
		
		return `${ lyricPair1.firstHalf }\r\n${ lyricPair1.secondHalf }\r\n${ lyricPair2.firstHalf }\r\n${ lyricPair2.secondHalf }`;
	}
	
	generateCompoundLyricBraided( characterLimit = 140, rhymeWith = null ) {
		const pairLimit = Math.floor( ( characterLimit - 6 ) / 2 );
		var lyricPair1 = this.generateLyricPair( pairLimit, rhymeWith );
		if ( !lyricPair1 ) return 'Sorry, but that word doesn\'t really inspire me';
		var lyricPair2 = this.generateLyricPair( pairLimit );
		
		const lowestSyllables = this.getLowestSyllables( lyricPair1.firstHalf, lyricPair1.secondHalf, lyricPair2.firstHalf, lyricPair2.secondHalf );
		lyricPair1 = this.formatLyricPair( this.limitSyllablesLyricPair( lyricPair1, lowestSyllables ) );
		lyricPair2 = this.formatLyricPair( this.limitSyllablesLyricPair( lyricPair2, lowestSyllables ) );
		
		return `${ lyricPair2.firstHalf }\r\n${ lyricPair1.firstHalf }\r\n${ lyricPair2.secondHalf }\r\n${ lyricPair1.secondHalf }`;
	}
	
	getLowestSyllables( /* as many segments as needed */ ) {
		var lowest = null;
		_.forIn( arguments, argument => {
			const syllables = syllable( argument );
			if ( !lowest || syllables < lowest ) lowest = syllables;
		} );
		return lowest;
	}
	
	limitSyllables( input, syllableLimit ) {
		var syllables = syllable( input );
		const wordArray = input.split( ' ' );
		while ( syllables > syllableLimit ) {
			const removedWord = wordArray.shift();
			const syllableCount = syllable( removedWord );
			syllables -= syllableCount;
		}
		if ( syllables != syllableLimit ) {
			const syllableDifference = syllableLimit - syllables;
			const key = `${ wordArray[0] } ${ wordArray[1] }`;
			if ( key in this.data ) {
				_.forIn( this.data[key], ( value, sentenceSegment ) => {
					if ( syllableDifference == syllable( sentenceSegment ) ) {
						wordArray.unshift( sentenceSegment );
						return false;
					}
				} );
			}
		}
		return wordArray.join( ' ' );
	}
	
	limitSyllablesLyricPair( lyricPair, syllableLimit ) {
		lyricPair.firstHalf = this.limitSyllables( lyricPair.firstHalf, syllableLimit );
		lyricPair.secondHalf = this.limitSyllables( lyricPair.secondHalf, syllableLimit );
		return lyricPair;
	}
	
	generateLyricPair( characterLimit, rhymeWith = null ) {
		var rhymeWithFinal;
		var firstHalf = null;
		var secondHalf = null;
		
		while ( !firstHalf || !secondHalf ) {
			rhymeWithFinal = ( !rhymeWith ) ? this.randomRhymeWord() : rhymeWith;
			rhymeWithFinal = rhymeWithFinal.toLowerCase();
			firstHalf = this.randomSegmentFromWord( rhymeWithFinal );
			secondHalf = null;
			var rhymeWords = rhymes( rhymeWithFinal );
			rhymeWords.forEach( ( rhymeWord, index ) => { rhymeWords[index] = rhymeWord.word.replace( /\(.*?\)/g, '' ) } );
			rhymeWords = this.shuffleArray( _.difference( rhymeWords, this.badTrailingElements, [ rhymeWithFinal ] ) );
			
			for ( var i = 0; i < rhymeWords.length; i++ ) {
				secondHalf = this.randomSegmentFromWord( rhymeWords[i] );
				if ( secondHalf ) break;
			}
		
			if ( rhymeWith && ( !firstHalf || !secondHalf ) ) return null;
		}
		
		// whichever has the fewer syllables has a word added, until char limit reached, or match not found
		// do syllable counts need to match?
		
		while ( true ) {
			var sentenceSegment;
			if ( syllable( firstHalf ) > syllable( secondHalf ) ) {
				sentenceSegment = this.generateSentenceSegment( secondHalf );
				if ( !sentenceSegment || sentenceSegment.length + firstHalf.length + secondHalf.length + 1 >= characterLimit ) break;
				secondHalf = `${ sentenceSegment } ${ secondHalf }`;
			} else if ( syllable( firstHalf ) <= syllable( secondHalf ) ) {
				sentenceSegment = this.generateSentenceSegment( firstHalf );
				if ( !sentenceSegment || sentenceSegment.length + firstHalf.length + secondHalf.length + 1 >= characterLimit ) break;
				firstHalf = `${ sentenceSegment } ${ firstHalf }`;
			}
		}
		
		return {
			firstHalf,
			secondHalf
		};
	}
	
	generateSentenceSegment( sentence ) {
		const words = sentence.split( ' ' );
		const key = `${ words[0] } ${ words[1] }`;
		if ( key in this.data ) {
			return this.randomProperty( this.data[key] );
		} else {
			return null;
		}
	}
	
	randomRhymeWord() {
		var rhymeWord;
		do {
			rhymeWord = this.randomProperty( this.data ).split( ' ' )[1];
		} while ( this.badTrailingElements.includes( rhymeWord ) );
		return rhymeWord;
	}
	
	randomSegmentFromWord( word ) {
		const keys = Object.keys( this.data );
		const matchKeys = [];
		keys.forEach( key => {
			if ( key.split( ' ' )[1] == word ) matchKeys.push( key );
		} );
		if ( matchKeys.length == 0 ) {
			return null;
		} else {
			return matchKeys[matchKeys.length * Math.random() << 0];
		}
	}
	
	formatLyricPair( lyricPair ) {
		lyricPair.firstHalf = this.formatSentence( lyricPair.firstHalf );
		lyricPair.secondHalf = this.formatSentence( lyricPair.secondHalf );
		return lyricPair;
	}
	
	formatSentence( sentence ) {
		return `${ this.capitalizeFirstLetter( this.capitalizeIs( sentence ) ) }`;
	}
	
	capitalizeFirstLetter( string ) {
		return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
	}
	
	capitalizeIs( string ) {
		return string.replace( /(^|\s)i($|\s|')/g, '$1I$2' );
	}
	
	randomProperty( object ) {
		const keys = Object.keys( object );
		if ( keys.length == 0 ) {
			return null;
		} else {
			return keys[keys.length * Math.random() << 0];
		}
	}
	
	shuffleArray( array ) {
		for ( var i = array.length - 1; i > 0; i-- ) {
			var j = Math.floor( Math.random() * ( i + 1 ) );
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}
}

module.exports = LyricGenerator;