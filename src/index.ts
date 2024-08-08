// import discord.js
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js"
import { Hono } from "hono"
const app = new Hono()

app.get("/", c => c.text("Hono!"))

export default app

// create a new Client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})

// listen for the client to be ready
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.MessageCreate, async message => {
	console.log(`Message: ${message.content}`)
	// Ignore messages from bots
	if (message.author.bot) return

	// Check if the message starts with the command prefix
	if (message.content.startsWith("!search")) {
		// Split the message content into arguments
		const args = message.content.slice(1).trim().split(/ +/)
		const command = args.shift()?.toLowerCase() as string

		// Check if the command is "search"
		if (command === "search") {
			// Get the search word and the word limit from the arguments
			const searchWord = args[0]
			const wordLimit = parseInt(args[1])

			if (!searchWord || isNaN(wordLimit)) {
				return message.reply(
					"Please provide a valid search word and word limit.",
				)
			}

			// Fetch messages from the channel
			const messages = await message.channel.messages.fetch({ limit: 100 })

			// Filter messages based on the search criteria
			const matchingMessages = messages.filter(
				m =>
					m.content.includes(searchWord) &&
					m.content.split(" ").length > wordLimit,
			)

			if (matchingMessages.size === 0) {
				return message.reply("No messages found matching the criteria.")
			}

			// Create response with message URLs
			const response = matchingMessages
				.map(
					m =>
						`https://discord.com/channels/${message.guild?.id}/${m.channel.id}/${m.id}`,
				)
				.join("\n")

			message.reply(`Found the following messages:\n${response}`)
		}
	}
})

// login with the token from .env.local
client.login(process.env.DISCORD_TOKEN)

