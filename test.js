const path = require( 'path' );

const LyricGenerator = require( './my_modules/lyric-generator' );

const lyricGenerator = new LyricGenerator();
lyricGenerator.trainFromFile( path.join( __dirname, 'data/hiphop.txt' ) );

console.log( lyricGenerator.generateCompoundLyric() );
console.log( '' );
console.log( lyricGenerator.generateCompoundLyric() );
console.log( '' );
console.log( lyricGenerator.generateCompoundLyric() );
console.log( '' );