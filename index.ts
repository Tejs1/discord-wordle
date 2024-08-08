const { Client, GatewayIntentBits } = require("discord.js")
import express from "express"
const bodyParser = require("body-parser")

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})
const app = express()
app.use(bodyParser.json())

const TOKEN = process.env.DISCORD_TOKEN

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

// client.on("messageCreate", message => {
// 	// Handle incoming messages if necessary
// })

// API endpoint to search messages
app.post("/search", async (req: express.Request, res: express.Response) => {
	const { word, limit } = req.body as { word: string; limit: number }
	if (!word || !limit) {
		return res.status(400).send("Word and limit are required.")
	}

	interface Message {
		messageId: string
		text: string
	}

	const result: Message[] = []
	const channels = client.channels.cache.filter((channel: any) =>
		channel.isText(),
	)

	for (const [channelId, channel] of channels) {
		let messages
		try {
			messages = await channel.messages.fetch({ limit: 100 }) // Adjust the limit as needed
		} catch (error) {
			console.error(`Failed to fetch messages in channel ${channelId}:`, error)
			continue
		}

		messages.forEach((message: any) => {
			if (message.content.includes(word) && message.content.length >= limit) {
				result.push({ messageId: message.id, text: message.content })
			}
		})
	}

	res.json(result)
})

// Start the Express server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

client.login(TOKEN)
