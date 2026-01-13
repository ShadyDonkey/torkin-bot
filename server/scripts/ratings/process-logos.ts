import { join } from 'node:path'
import { createApplicationEmoji, listApplicationEmojis } from 'dressed'

const logos = {
  IMDb: 'IMDb.png',
  RottenTomatoes: 'Rotten_Tomatoes.png',
  Metacritic: 'Metacritic.png',
  TMDB: 'TMDB.png',
}

const existingEmojis = await listApplicationEmojis()

for (const [name, logo] of Object.entries(logos)) {
  const emoji = existingEmojis.items.find((emoji) => emoji.name === `${name}`)

  if (emoji) {
    continue
  }

  const file = Bun.file(join(__dirname, 'images', logo))
  const arrayBuffer = await file.arrayBuffer()
  const base64Image = Buffer.from(arrayBuffer).toString('base64')
  const discordFormatted = `data:image/png;base64,${base64Image}`

  await createApplicationEmoji({
    name,
    image: discordFormatted,
  })
}

process.exit(0)
