const dict = require( 'cmu-pronouncing-dictionary' );
const { merge } = require( 'lodash' );

var words = [];

Object.keys( dict ).forEach( word => {
	words.push( {
		word: word,
		pron: dict[word]
	} );
} );

module.exports = function rhymes ( input ) {
	if ( !input ) return [];
	input = input.toLowerCase();
	if ( !dict[input] ) return [];
	var inputPron = dict[input];
	var results = [];

	words.forEach( word => {
		var score = countMatchingTrailingSyllablesInPronunciations( inputPron, word.pron );
		if ( score > 1 ) {
			results.push( merge( word, { score: score } ) );
		}
	} );

	return results;
}

function countMatchingTrailingSyllablesInPronunciations ( a, b ) {
	a = a.split(' ').reverse();
	b = b.split(' ').reverse();
	var score = 0;
	var shorterPron = ( a.length < b.length ) ? a : b;

	for ( var i in shorterPron ) {
		if ( a[i] === b[i] ) {
			score++;
		} else {
			return score;
		}
	}

	return score
}