const path = require( 'path' );

const TwitQueued = require( './my_modules/twit-queued' );
const LyricGenerator = require( './my_modules/lyric-generator' );
const TwitterBot = require( './my_modules/twitter-bot' );
const twitterCredentials = require( './data/twitter-credentials' );

const twit = new TwitQueued( twitterCredentials );
const lyricGenerator = new LyricGenerator();
lyricGenerator.trainFromFile( path.join( __dirname, 'data/hiphop.txt' ) );
const twitterBot = new TwitterBot( twit, lyricGenerator );

//twitterBot.beginStatusPosts();
//twitterBot.beginTaggedPostResponses();