const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys')
const { state, saveState } = useSingleFileAuthState('./session.json')
const config = require('./config')
const download = require('./modules/download')
const utils = require('./modules/utils')

async function startBot() {
  const sock = makeWASocket({ auth: state })

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return
    const text = msg.message.conversation

    if (text === `${config.PREFIX}ping`) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'pong' })
    }

    if (text.startsWith(`${config.PREFIX}hello`)) {
      const name = text.replace(`${config.PREFIX}hello `,'')
      await sock.sendMessage(msg.key.remoteJid, { text: utils.sayHello(name) })
    }

    if (text.startsWith(`${config.PREFIX}download `)) {
      const url = text.replace(`${config.PREFIX}download `,'')
      download.downloadMedia(url)
      await sock.sendMessage(msg.key.remoteJid, { text: 'Download started!' })
    }
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot()
      }
    } else if(connection === 'open') {
      console.log('Bot is online!')
    }
  })

  sock.ev.on('creds.update', saveState)
}

startBot()
