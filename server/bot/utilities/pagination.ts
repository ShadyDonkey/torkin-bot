import { MessageFlags } from 'discord-api-types/v10'
import { bold, subtext } from 'discord-fmt'
import {
  ActionRow,
  Button,
  Container,
  type MessageComponentInteraction,
  Section,
  Separator,
  TextDisplay,
  Thumbnail,
} from 'dressed'
import { type CmdFindCacheEntry, keyv, keyvConfig } from '@/server/lib/keyv'
import { search } from '@/shared/lib/tvdb'
import { unwrap } from '@/shared/utilities'

export async function paginateSearch(interaction: MessageComponentInteraction, page: number) {
  if (!interaction.message.interaction_metadata) {
    return interaction.update({
      components: [TextDisplay('No interaction found on the original message.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(keyvConfig.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    console.error({ cacheErr, cached })
    return interaction.update({
      components: [TextDisplay('Could not retrieve cached search results, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const [searchErr, searchResponse] = await unwrap(
    search(cached.query, cached.searchType === 'tv' ? 'series' : 'movie', page, 3),
  )

  if (searchErr || !searchResponse.data) {
    console.error({ searchErr })
    return interaction.update({
      components: [TextDisplay('An error occurred while searching for movies, please try again later.')],
      flags: MessageFlags.IsComponentsV2,
    })
  }

  const totalResults = searchResponse.links?.total_items || 1
  const totalPages = Math.ceil(totalResults / 5)
  const paginationComponents = buildPaginationButtons(page, totalPages)

  const entries = searchResponse.data
    .map((entry, index) => {
      if (!entry.extended_title || !entry.image_url) {
        return null
      }

      let body = ''

      body += `${bold(entry.extended_title)}\n`

      if (entry.genres && entry.genres.length > 0) {
        body += `${subtext(entry.genres.join(', '))}\n`
      }

      if (entry.overview) {
        body += `\n${entry.overview.substring(0, 255)}...\n`
      }

      const section = Section([body], Thumbnail(entry.image_url))
      const components: any[] = [
        section,
        ActionRow(
          Button({
            custom_id: `test-${entry.id ?? Math.random().toString(36).substring(2, 15)}`,
            label: `⌃ View Details`,
            style: 'Secondary',
          }),
        ),
      ]

      if (searchResponse.data?.length && index < searchResponse.data.length - 1) {
        components.push(Separator())
      }

      return components
    })
    .filter((entry) => entry !== null)
    .flat()

  const components = [Container(...entries), paginationComponents]

  return interaction.update({
    components,
    flags: MessageFlags.IsComponentsV2,
  })
}

export function buildPaginationButtons(currentPage: number, totalPages: number) {
  const JUMP_TO_FIRST = currentPage !== 1
  const JUMP_TO_LAST = currentPage !== totalPages
  const PREVIOUS_PAGE = currentPage !== 1
  const NEXT_PAGE = currentPage !== totalPages

  return ActionRow(
    Button({
      custom_id: 'find-goto-1-first',
      label: '«',
      disabled: !JUMP_TO_FIRST,
      style: 'Primary',
    }),

    Button({
      custom_id: `find-goto-${currentPage - 1}-prev`,
      label: '‹',
      disabled: !PREVIOUS_PAGE,
      style: 'Primary',
    }),

    Button({
      custom_id: 'find-activepage',
      label: `⌂`,
      disabled: true,
      style: 'Secondary',
    }),

    Button({
      custom_id: `find-goto-${currentPage + 1}-next`,
      label: '›',
      disabled: !NEXT_PAGE,
      style: 'Primary',
    }),

    Button({
      custom_id: `find-goto-${totalPages}-last`,
      label: '»',
      disabled: !JUMP_TO_LAST,
      style: 'Primary',
    }),
  )
}
