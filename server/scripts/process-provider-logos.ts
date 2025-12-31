import { createApplicationEmoji, listApplicationEmojis } from 'dressed'
import { getAvailableWatchProviders, getImageUrl } from '@/server/lib/tmdb'
import { DUPLICATE_PROVIDER_ID_MAPPING } from '@/server/lib/tmdb/watch-providers'

const movieProviders = await getAvailableWatchProviders('movie')
const tvProviders = await getAvailableWatchProviders('tv')

const providers = new Map<
  number,
  {
    name: string
    logo: string
    id: number
    priority: number
  }
>()

for (const provider of [...(movieProviders.results ?? []), ...(tvProviders.results ?? [])]) {
  if (!provider.logo_path || !provider.provider_name || !provider.display_priorities?.US) {
    continue
  }

  providers.set(provider.provider_id, {
    name: provider.provider_name,
    logo: getImageUrl(provider.logo_path),
    id: provider.provider_id,
    priority: provider.display_priorities.US,
  })
}

const priorityFiltered = new Map([...providers].filter(([_, provider]) => provider.priority <= 15))

const uniqueProviders = new Map()

for (const [id, provider] of priorityFiltered) {
  if (DUPLICATE_PROVIDER_ID_MAPPING[id]) {
    const newProviderEntry = providers.get(DUPLICATE_PROVIDER_ID_MAPPING[id])
    if (newProviderEntry) {
      uniqueProviders.set(DUPLICATE_PROVIDER_ID_MAPPING[id], newProviderEntry)
    }
  } else {
    uniqueProviders.set(id, provider)
  }
}

const existingEmojis = await listApplicationEmojis()

for (const [id, provider] of uniqueProviders) {
  const emoji = existingEmojis.items.find((emoji) => emoji.name === `watch_provider_${id}`)

  if (emoji) {
    continue
  }

  const logoUrl = provider.logo
  const response = await fetch(logoUrl)
  const arrayBuffer = await response.arrayBuffer()
  const base64Image = Buffer.from(arrayBuffer).toString('base64')

  const discordFormatted = `data:image/jpeg;base64,${base64Image}`

  await createApplicationEmoji({
    image: discordFormatted,
    name: `watch_provider_${id}`,
  })
}

process.exit(0)
