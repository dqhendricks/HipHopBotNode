After creating my first Markov chain Twitter bot (AKA "_ebooks" bot), I wanted to see what else I could accomplish with Markov chaining. Could they be used to generate song lyrics? Lyrics generally need to rhyme and have similar numbers of syllables per line, so I found an npm rhyme dictionary as well as a syllable counting utility.

In order to make rhyming lyrics, I decided I would have to start at the end of the sentence chain and work my way backwards instead of using a typical Markov chain which starts at the beginning. I scraped the lyrics of the top 100 hip hop songs from a website and used it to train the Markov generator, then generated two lines, starting with two rhyming words on the right hand sides. Finding two words that rhyme, and are also both keys in the Markov chain data is not a sure thing, so sometimes I have to start over with a new word until I find something that works. Creating both lines simultaniously, I am able to add new words to whichever line has the fewest syllables, until I can't find any more links in the chain, or reach a specified character limit. This worked fairly well, but to make it better I have the application go back in after generation and try to get their syllable counts closer to matching. I then added the ability to braid two lyric pairs into one lyric, alternating the rhymes.


You lemons make lemonade, you is not a g though look
I'm payin' dwayne wade, the money lil mama took

We 'bout to hit it and quit, it's yo birthday we gon' sip
Up or we go upside there wit, and take a vacation to trip

When I tried to say I fell, me go cause bad to the bone
Cosmo says you're fat well, my soul in my flippin' zone


I'm thinking I need a lot more training text however since there are so many keys with only one phrase to choose from. I think I could also apply this to other music styles fairly easily by switching the training text, but I think hip hop will work best with Twitter's character limit.

If you send the twitter bot a one word tweet, the bot will try to use that word as a rhyming word in it's generated lyric. Often, however, the word cannot be found in the training text, or even if the word is found, there may not be a rhyming word found in the training text. In these cases it will respond saying something like, "Sorry, but your word didn't really inspire me," or something. The more training text used, the less chance of this failing.
