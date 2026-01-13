import { Button, Container, Section, Separator, TextDisplay, Thumbnail } from '@dressed/react'
import { type UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { h2, list } from 'discord-fmt'
import { useEffect, useMemo, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ItemActions, ListingPreview, PaginationButtons } from '../../../bot/components/builders'
import { TrendingMovieDetails, TrendingTvDetails } from '../../../bot/components/tmdb'
import { useUserPreferences } from '../../../bot/providers/user-preferences'
import { db } from '../../../lib/db'
import { getAvailableWatchProviders, getDetails, getImageUrl, getItemWatchProviders } from '../../../lib/tmdb'
import type {
  MovieExternalIdsResponse,
  MovieTranslationsResponse,
  MovieVideosResponse,
  StandardListing,
  TvExternalIdsResponse,
  TvTranslationsResponse,
  TvVideosResponse,
  TypeSelection,
} from '../../../lib/tmdb/types'
import { DUPLICATE_PROVIDER_ID_MAPPING } from '../../../lib/tmdb/watch-providers'
import { paginateArray, unwrap } from '../../../utilities'
import { logger } from '../../../utilities/logger'
import type { UserTrackingEntryData } from '../../../zenstack/models'
import { botLogger } from '../../utilities/logger'
import ErrorPage from './error'
import { Ratings } from './ratings'
import { RecommendationsPage } from './recommendations'

const ITEMS_PER_PAGE = 4

export function Listings({
  initialPage,
  queryData,
  listTitle,
}: Readonly<{ initialPage: number; queryData: UndefinedInitialDataOptions<StandardListing[]>; listTitle?: string }>) {
  const query = useQuery(queryData)
  const [page, setPage] = useState(initialPage)
  const [focused, setFocused] = useState<number>()
  const [recommendationsFor, setRecommendationsFor] = useState<{ id: number; type: TypeSelection } | null>(null)

  if (!query.data) {
    return (
      <>
        {query.isLoading ? (
          <>
            <Container>Fetching listings...</Container>
            <PaginationButtons currentPage={initialPage} />
          </>
        ) : (
          <ErrorPage code={500}>There was an error fetching listings!</ErrorPage>
        )}
      </>
    )
  }

  if (focused !== undefined && query.data[focused] && recommendationsFor) {
    const listing = query.data[focused]
    return <RecommendationsPage listing={listing} onBack={() => setRecommendationsFor(null)} />
  }

  if (focused !== undefined && query.data[focused]) {
    return (
      <ListingPage
        listing={query.data[focused]}
        onBack={() => setFocused(undefined)}
        onShowRecommendations={(id, type) => {
          setRecommendationsFor({ id, type })
        }}
      />
    )
  }

  const { results, totalPages } = paginateArray(query.data, page, ITEMS_PER_PAGE)

  return (
    <>
      {listTitle && h2(listTitle)}
      <Container>
        {results.map((item, index) => {
          const globalIndex = (page - 1) * ITEMS_PER_PAGE + index
          return (
            <Fragment key={item.id}>
              <ListingPreview onClick={() => setFocused(globalIndex)} {...item} />
              {index < results.length - 1 && <Separator />}
            </Fragment>
          )
        })}
        {results.length === 0 && 'No listings found!'}
      </Container>
      <PaginationButtons currentPage={page} totalPages={totalPages} setPage={setPage} />
    </>
  )
}

type MDE = {
  videos: { results: MovieVideosResponse['results'] }
  external_ids: MovieExternalIdsResponse
  translations: {
    translations: MovieTranslationsResponse['translations']
  }
}

type TVDE = {
  videos: { results: TvVideosResponse['results'] }
  external_ids: TvExternalIdsResponse
  translations: {
    translations: TvTranslationsResponse['translations']
  }
}

export function ListingPage({
  listing,
  onBack,
  backText,
  onShowRecommendations,
  disableRecommendations,
}: Readonly<{
  listing: StandardListing
  onBack: () => void
  backText?: string
  onShowRecommendations?: (id: number, type: TypeSelection) => void
  disableRecommendations?: boolean
}>) {
  const userPreferences = useUserPreferences()
  const [mergedListing, setMergedListing] = useState(structuredClone(listing))
  const query = useQuery({
    queryKey: ['details', listing.type, listing.id],
    queryFn: () => getDetails<MDE, TVDE>(listing.type, listing.id, ['videos', 'external_ids', 'translations']),
  })
  const canTrack = useMemo(() => {
    if (!query.data) {
      return false
    }

    if (query.data.type === 'movie') {
      return query.data.details.status !== 'Released'
    }

    if (query.data.type === 'tv') {
      return query.data.details.status !== 'Ended'
    }

    return false
  }, [query.data])

  const { type, details } = (query.data ?? listing) as StandardListing<TypeSelection, MDE, TVDE> | StandardListing

  useEffect(() => {
    if ('translations' in details) {
      const translation = details.translations.translations?.find((t) => t.iso_639_1 === userPreferences.language)
      if (!translation?.data) {
        return
      }

      const obj = {} as Pick<StandardListing, 'title' | 'description'>

      if (type === 'movie') {
        const { data } = translation as NonNullable<MovieTranslationsResponse['translations']>[number]
        if (data?.title?.length) {
          obj.title = data.title
        }
      } else if (type === 'tv') {
        const { data } = translation as NonNullable<TvTranslationsResponse['translations']>[number]
        if (data?.name?.length) {
          obj.title = data.name
        }
      }
      if (translation.data.overview?.length) {
        obj.description = translation.data.overview
      }
      setMergedListing((prev) => ({ ...prev, ...obj }))
    }
  }, [userPreferences.language, type, details])

  return (
    <>
      <Container>
        <Section accessory={<Thumbnail media={getImageUrl(mergedListing.thumbnail ?? '')} />}>
          ## {mergedListing.title}{' '}
          {mergedListing.releaseDate && `(${format(new Date(mergedListing.releaseDate), 'yyyy')})`}
          {'\n'}
          <Ratings
            voteAverage={mergedListing.voteAverage}
            imdbId={'external_ids' in details ? details.external_ids.imdb_id : undefined}
          />
        </Section>
        {mergedListing.description}
        {'\n'}
        {type === 'movie' ? <TrendingMovieDetails details={details} /> : <TrendingTvDetails details={details} />}
        <TextDisplay>
          Watch Now ({userPreferences.country ?? 'US'}):{'\n'}
          <Availability id={mergedListing.id} type={type} country={userPreferences.country} />
        </TextDisplay>
      </Container>
      <ItemActions id={mergedListing.id.toString()} type={type}>
        <Button onClick={onBack} label={backText ?? 'Back'} />

        {'videos' in details && (
          <>
            {details.external_ids.imdb_id && (
              <Button url={`https://www.imdb.com/title/${details.external_ids.imdb_id}`} label="View on IMDb" />
            )}
            {details.videos.results && findTrailer(details.videos.results).length > 0 && (
              <Button url={findTrailer(details.videos.results)} label="View Latest Trailer" />
            )}
          </>
        )}

        <Button
          disabled={!canTrack}
          onClick={async (interaction) => {
            if (!interaction?.user.id) {
              return
            }

            const [[dbErr, settings]] = await Promise.all([
              unwrap(db.userTrackingSetting.findFirst({ where: { userId: interaction.user.id } })),
              interaction.deferReply({ ephemeral: true }),
            ])

            if (dbErr) {
              botLogger.error({ err: dbErr }, 'Error loading tracking settings')
              return await interaction.editReply('Error loading tracking settings')
            }

            if (!settings) {
              return await interaction.editReply(
                'No tracking settings found, please set up `/tracking settings` before you can track listings.',
              )
            }

            if (!query.data) {
              return await interaction.editReply('No data available for this item.')
            }

            let data: UserTrackingEntryData | null = null
            let notifyOn: string | null = null

            if (query.data.type === 'movie') {
              if (!query.data.releaseDate) {
                return await interaction.editReply('No release date found for this movie.')
              }

              data = { id: query.data.id, type: 'movie', releaseDate: query.data.releaseDate }
              notifyOn = query.data.releaseDate ?? null
            } else if (query.data.type === 'tv') {
              const nextEpisode = query.data.details?.next_episode_to_air as {
                id: number
                air_date: string
                episode_number: number
                season_number: number
                show_id: number
              }

              if (!nextEpisode) {
                return await interaction.editReply('No next episode found for this TV show.')
              }

              data = {
                id: query.data.id,
                type: 'tv',
                episode: {
                  id: nextEpisode.id,
                  airDate: nextEpisode.air_date,
                  episodeNumber: nextEpisode.episode_number,
                  seasonNumber: nextEpisode.season_number,
                  showId: nextEpisode.show_id,
                },
              }
              notifyOn = nextEpisode.air_date ?? null
            }

            if (!notifyOn || !data) {
              return await interaction.editReply('No compatible release date found for this item.')
            }

            const [existingErr, existing] = await unwrap(
              db.userTrackingEntry.findFirst({
                where: {
                  userId: interaction.user.id,
                  tmdbData: { type: { equals: data.type }, id: { equals: data.id } },
                },
              }),
            )

            if (existingErr) {
              botLogger.error({ err: existingErr })
              return await interaction.editReply('Error checking for existing tracking information.')
            }

            if (existing) {
              return await interaction.editReply('You are already tracking this item.')
            }

            const [createErr] = await unwrap(
              db.userTrackingEntry.create({
                data: {
                  userId: interaction.user.id,
                  createdBy: interaction.user.id,
                  tmdbData: data,
                  notifyDate: new Date(notifyOn),
                },
              }),
            )

            if (createErr) {
              botLogger.error({ err: createErr })
              return await interaction.editReply('Error tracking this item.')
            }

            return await interaction.editReply('You are now tracking this item.')
          }}
          style="Secondary"
          label={`Track ${type === 'movie' ? 'Movie' : 'TV Show'}`}
        />

        {onShowRecommendations && !disableRecommendations && (
          <Button
            onClick={() => onShowRecommendations(listing.id, listing.type)}
            label={`Similar ${type === 'movie' ? 'Movies' : 'TV Shows'}`}
            style="Secondary"
          />
        )}
      </ItemActions>
    </>
  )
}

function Availability({ type, id, country }: Readonly<{ type: 'movie' | 'tv'; id: number; country: string }>) {
  const query = useQuery({
    queryKey: ['availability', type, id],
    queryFn: () => getItemWatchProviders(type, { id, season: 1 }),
  })

  const [providers, setProviders] = useState<string | null>(null)

  useEffect(() => {
    if (query.data) {
      // @ts-expect-error TypeScript is reading this as a dictionary but we need to shove a string into it.
      const results = query.data.results?.[country] ?? query.data.results?.US ?? {}
      const flatrate = results.flatrate ?? []
      const free = results.free ?? []
      const buy = results.buy ?? []
      const rent = results.rent ?? []

      const promises = [
        dedupeProviders(type, free),
        dedupeProviders(type, flatrate),
        dedupeProviders(type, buy),
        dedupeProviders(type, rent),
      ]

      Promise.all(promises).then((r) => {
        setProviders(
          list(
            ...(r
              .map((p, i) => {
                if (p.length > 0) {
                  return `${['Streaming (Free)', 'Streaming', 'Buy', 'Rent'][i] ?? 'Unknown'}: ${p.join(', ')}`.trim()
                }
                return null
              })
              .filter(Boolean) as string[]),
          ),
        )
      })
    }
  }, [query.data, type, country])

  if (!query.data) {
    return query.isLoading ? '...' : 'Error Loading'
  }

  return providers || 'Not Available'
}

async function dedupeProviders(
  type: TypeSelection,
  providers: {
    logo_path?: string
    provider_id: number
    provider_name?: string
    display_priority: number
  }[],
) {
  const preFilteredIds = providers.filter((p) => p.provider_name).map((p) => p.provider_id)
  const filteredIds = preFilteredIds.map((id) => DUPLICATE_PROVIDER_ID_MAPPING[id] || id)
  const dedupedIds = new Set(filteredIds)

  const [err, response] = await unwrap(getAvailableWatchProviders(type))

  if (err) {
    logger.error({ err }, 'Error fetching available watch providers')
    return providers.map((p) => p.provider_name)
  }

  if (!response.results) {
    logger.error({ response }, 'No results found for available watch providers')
    return providers.map((p) => p.provider_name)
  }

  const availableProviders = response.results.filter((r) => dedupedIds.has(r.provider_id))
  return availableProviders.map((p) => p.provider_name)
}

function findTrailer(results: MovieVideosResponse['results'] | TvVideosResponse['results']) {
  if (!results) {
    return ''
  }

  const filtered = results?.filter(
    (r) => r.type === 'Trailer' && r.site === 'YouTube' && r.official && r.iso_3166_1 === 'US',
  )

  if (filtered.length === 0 || !filtered[0]?.key) {
    return ''
  }

  return `https://youtube.com/watch?v=${filtered[0].key}`
}
