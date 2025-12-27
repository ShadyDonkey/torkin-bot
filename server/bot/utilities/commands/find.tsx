import { Button, Container, type MessageComponentInteraction, Section, Separator, Thumbnail } from '@dressed/react'
import { bold, subtext } from 'discord-fmt'
import { Fragment } from 'react/jsx-runtime'
import { PaginationButtons } from '@/server/bot/utilities/builders'
import { logger } from '@/server/bot/utilities/logger'
import { type CmdFindCacheEntry, KEYV_CONFIG, keyv } from '@/server/lib/keyv'
import { REMOTE_IDS_MOVIE, REMOTE_IDS_SERIES, search } from '@/server/lib/tvdb'
import { unwrap } from '@/server/utilities'

const ITEMS_PER_PAGE = 3

export async function paginateSearch(interaction: MessageComponentInteraction, page: number) {
  if (!interaction.message.interaction_metadata) {
    return await interaction.reply('No interaction found on the original message.', { ephemeral: true })
  }

  await interaction.deferUpdate()

  const [cacheErr, cached] = await unwrap(
    keyv.get<CmdFindCacheEntry>(KEYV_CONFIG.cmd.find.key(interaction.message.interaction_metadata.id)),
  )

  if (cacheErr || !cached) {
    logger.error({ cacheErr, cached })
    return await interaction.updateResponse('Could not retrieve cached search results, please try again later.')
  }

  const [searchErr, searchResponse] = await unwrap(
    search(cached.query, cached.searchType === 'tv' ? 'series' : 'movie', page, ITEMS_PER_PAGE),
  )

  if (searchErr || !searchResponse.data) {
    logger.error({ searchErr })
    return await interaction.updateResponse('An error occurred while searching for movies, please try again later.')
  }

  const totalResults = searchResponse.links?.total_items || 1
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

  return await interaction.updateResponse(
    <>
      <Container>
        {searchResponse.data.map((entry, index) => {
          if (!entry.image_url) {
            return null
          }

          const tmdbId = entry.remote_ids?.find((remoteId) =>
            cached.searchType === 'movie'
              ? remoteId.type === REMOTE_IDS_MOVIE.tmdb
              : remoteId.type === REMOTE_IDS_SERIES.tmdb,
          )?.id

          const yearText = entry.year ? `(${entry.year})` : ''
          const titleWithYear = `${bold(entry.title ?? entry.name ?? 'Unknown')} ${yearText}`

          return (
            <Fragment key={entry.id}>
              <Section
                accessory={
                  <Button
                    custom_id={`find-view-details-${tmdbId || entry.id}-${page}`}
                    label="View Details"
                    style="Secondary"
                    disabled={!tmdbId}
                  />
                }
              >
                {entry.extended_title ? bold(entry.extended_title) : titleWithYear}
                {entry.genres && entry.genres.length > 0 && `\n${subtext(entry.genres.join(', '))}`}
              </Section>
              <Section accessory={<Thumbnail media={entry.image_url} />}>
                {entry.overview ? `${entry.overview.substring(0, 255)}...` : '‎ '}
              </Section>
              {searchResponse.data?.length && index < searchResponse.data.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </Container>
      <PaginationButtons currentPage={page} prefix="find" totalPages={totalPages} />
    </>,
  )
}
