require('dotenv').config()
const express = require('express')
var cors = require('cors');
const { default: axios } = require('axios');
const { Translate } = require('@google-cloud/translate').v2;
var SpellChecker = require('simple-spellchecker');
// const { Redis } = require('ioredis');

// const client = new Redis();


const app = express()
app.use(cors())
app.use(express.json())

const translate = new Translate({
    key: process.env.API_KEY
});


app.post('/api/translate', async (req, res) => {
    let { text, from, to, spellcheck } = req.body;
    try {

        if (from === "en-IN") {
            if (to === "ta-IN") {
                to = "ta"
            }
            if (to === "te-IN") {
                to = "te"
            }
            if (to === "hi-IN") {
                to = "hi"
            }
            if (to === "mr-IN") {
                to = "mr"
            }

            let translation = "";

            if (spellcheck) {
                const wordlength = text.split(" ").length;
                let counter = 0;
                SpellChecker.getDictionary("en-US", async (err, dictionary) => {
                    for (const word of text.split(" ")) {
                        const misspelled = !dictionary.spellCheck(word);

                        if (misspelled) {
                            const suggestions = await dictionary.getSuggestions(word);
                            let correctedWord = suggestions.length > 0 ? suggestions[0] : word;
                            const res = await checkRedis(correctedWord)
                            if (res) {
                                translation += (res + " ");
                            }
                            else {
                                const response = await axios.get(`https://transliteration.devnagri.com/api/tl/${to}/${correctedWord}`)
                                await setRedisWord(correctedWord, response.data.result[0]);
                                translation += (response.data.result[0] + " ");
                            }
                        }
                        else {
                            const res = await checkRedis(word)
                            if (res) {
                                translation += (res + " ");
                            }
                            else {
                                const response = await axios.get(`https://transliteration.devnagri.com/api/tl/${to}/${word}`)
                                await setRedisWord(word, response.data.result[0]);
                                translation += (response.data.result[0] + " ");
                            }
                        }
                        counter++;
                        if (counter === wordlength){
                            res.json({ success: true, translation });
                        }
                    }
                })



            } else {
                for (const t of text.split(" ")) {
                    const res = await checkRedis(t);
                    if (res) {
                        translation += (res + " ");
                    } else {
                        try {
                            const response = await axios.get(`https://transliteration.devnagri.com/api/tl/${to}/${t}`);
                            await setRedisWord(t, response.data.result[0]);
                            translation += (response.data.result[0] + " ");
                        } catch (error) {
                            // console.error("Error occurred:", error);
                        }
                    }
                }

                res.json({ success: true, translation });
            }
        }
        else {
            const [translation] = await translate.translate(text, {
                from: from,
                to: to,
            });
            res.json({ success: true, translation })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false })
    }
});

app.listen(8000, () => { console.log("Backend Started at port", 8000) })


const checkRedis = async (word) => {
    // const lowerCasedWord = word.toLowerCase();
    // const data = await client.get(lowerCasedWord)
    // if (data) {
    //     console.log("Cache Hit")
    //     return data
    // }
    // else {
    return null
    // }
}

const setRedisWord = async (word, translation) => {
    // const lowerCasedWord = word.toLowerCase();
    // await client.set(lowerCasedWord, translation)
    // console.log("Cache Miss")
}

