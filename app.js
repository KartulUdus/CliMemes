const fs = require('fs')
const request = require('request')
const app = require('commander')
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

const hookRegex = new RegExp('(?:(?:https?):\\/\\/|www\\.)(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|[-A-Z0-9+&@#\\/%=~_|$?!:,.])*(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|[A-Z0-9+&@#\\/%=~_|$])', 'igm')

const templates = ["tenguy",
"afraid",
"apcr",
"older",
"aag",
"atis",
"tried",
"biw",
"stew",
"blb",
"kermit",
"bd",
"ch",
"cbg",
"wonka",
"cb",
"gandalf",
"keanu",
"cryingfloor",
"dsm",
"disastergirl",
"live",
"ants",
"doge",
"trump",
"drake",
"ermg",
"facepalm",
"firsttry",
"fwp",
"fa",
"fbf",
"fmr",
"fry",
"ggg",
"grumpycat",
"harold",
"hipster",
"icanhas",
"crazypills",
"mw",
"noidea",
"regret",
"boat",
"hagrid",
"sohappy",
"captain",
"bender",
"inigo",
"iw",
"ackbar",
"happening",
"joker",
"ive",
"jd",
"ll",
"lrv",
"leo",
"away",
"morpheus",
"mb",
"badchoice",
"mmm",
"spongebob",
"soup-nazi",
"jetpack",
"imsorry",
"red",
"mordor",
"oprah",
"oag",
"remembers",
"persian",
"philosoraptor",
"jw",
"patrick",
"rollsafe",
"sad-obama",
"sad-clinton",
"sadfrog",
"sad-bush",
"sad-biden",
"sad-boehner",
"saltbae",
"sarcasticbear",
"dwight",
"sb",
"ss",
"soa",
"sf",
"dodgson",
"money",
"snek",
"sk",
"sohot",
"nice",
"awesome-awkwardawesome",
"awkward-awesome",
"awkward",
"stop-it",
"fetch",
"success",
"scc",
"ski",
"aint-got-time",
"officespace",
"interesting",
"toohigh",
"bs",
"fine",
"sparta",
"ugandanknuck",
"puffin",
"whatyear",
"center",
"both",
"winter",
"xy",
"buzz",
"yodawg",
"yuno",
"yallgot",
"gears",
"bad",
"elf",
"chosen",
"custom"]

let memeLink = `https://memegen.link/{TEMPLATE}/{TOP}/{BOTTOM}.jpg?font=impact`
app  
    .version('0.1.0')
    .option('-m, --meme [template]', 'Meme template')
    .option('-t, --top [top]', 'top caption')
    .option('-b, --bottom [bottom]', 'bottom caption')
    .option('-l, --link [link]', 'link to custom image')
    .option('-w, --webhook [webhook]', 'slack webhook endpoint')
    .option('-s, --save', 'save the meme to memes/ folder')
    .option('-c, --channel [channel]', 'slack channel override')
    .parse(process.argv)


const memeq = async () => {
    return new Promise( resolve => {
        if(!app.meme) { 
            console.log('\nNo meme template provided.\n') 
        } else if(!templates.includes(app.meme)) {
            console.log('\nUnrecognized meme template.\n')
        }
        rl.question(`What meme would you like to use?
valid options are:  
${templates.join(', ')}\n > `, async (answer) => {
            app.meme = answer
            if(!templates.includes(answer)) {
                resolve(await memeq())
            } else { 
                resolve()
            }          
        })
    })
}
const linkq = async () => {
    return new Promise( resolve => {
        if(!app.link) { console.log('\nNo custom meme link provided.\n') 
        } else if(app.link && !app.link.match(hookRegex)) {
            console.log('\nMeme link doesn\'t look like a link\n')
        }
        rl.question(`Please provide a link to a custom image \n> `, async (answer) => {
            app.link = answer
            if(!app.link.match(hookRegex)) {
                resolve(await linkq())
            } else { 
                memeLink = memeLink.concat(`&alt=${app.link}`)                              
                resolve()
            }          
        })
    })
}
const topq = async () => {
    return new Promise( resolve => {
        if(!app.top || app.top.length) console.log('\nNo top meme caption provided.\n') 
        rl.question(`Please provide a top caption\n> `, async (answer) => {
            app.top = answer
            if(!answer.length) {
                resolve(await topq())
            } else {     
                app.top = app.top.replace(/ /gi, '-')           
                resolve()
            }       
        })
    })
}
const bottomq = async () => {
    return new Promise( resolve => {
        if(!app.bottom || app.bottom.length) console.log('\nNo bottom meme caption provided.\n') 
        rl.question(`Please provide a bottom caption\n> `, async (answer) => {
            app.bottom = answer
            if(!answer.length) {
                resolve(await topq())
            } else {
                resolve()
            }       
        })
    })
}

module.exports = async () => {
    // check that required args are present
    if(!templates.includes(app.meme)) await memeq()
    if(app.meme === 'custom' && !app.link || app.name === 'custom' && !app.link.match(hookRegex)) await linkq()
    if(!app.top || !app.top.length) await topq()
    if(!app.bottom || !app.bottom.length) await bottomq()
    // replace spaces with dashes 
    app.bottom = app.bottom.replace(/ /gi, '-')                
    app.top = app.top.replace(/ /gi, '-')     

    memeLink = memeLink.replace('{TEMPLATE}', app.meme).replace('{TOP}', app.top).replace('{BOTTOM}', app.bottom)

    if (app.save) request(memeLink).pipe(fs.createWriteStream(`${__dirname}/${app.meme}_${app.top}_${app.bottom}.png`))
    let message = {
        attachments: [{
            fallback: `${app.meme}_${app.top}_${app.bottom}.png`,
            image_url: memeLink,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }],
        icon_emoji: ':ghost:',
        username: 'memeBot'
    }
    if (app.channel && app.channel.length) message.channel = `#${app.channel}`
    if (app.webhook && !app.webhook.match(hookRegex)) console.log('slack webhook doesn\'t look like a link')
    if (app.webhook && app.webhook.match(hookRegex)) request.post(app.webhook, {form: JSON.stringify(message)})
    console.log(`url to meme: ${memeLink}`)
    rl.close()
}

