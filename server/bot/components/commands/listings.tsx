import { inspect } from 'node:util'
import { Button, Container, Section, Separator, TextDisplay, Thumbnail } from '@dressed/react'
import { type UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { h2 } from 'discord-fmt'
import { useEffect, useMemo, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { ItemActions, ListingPreview, PaginationButtons } from '../../../bot/components/builders'
import { TrendingMovieDetails, TrendingTvDetails, VoteSection } from '../../../bot/components/tmdb'
import { useUserPreferences } from '../../../bot/providers/user-preferences'
import { db } from '../../../lib/db'
import { getDetails, getImageUrl, getItemWatchProviders } from '../../../lib/tmdb'
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
import type { UserTrackingEntryData } from '../../../zenstack/models'
import { useInteraction } from '../../providers/interaction'
import { botLogger } from '../../utilities/logger'
import ErrorPage from './error'
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
  const interaction = useInteraction()
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
          {mergedListing.voteAverage > 0 && <VoteSection voteAverage={mergedListing.voteAverage} />}
        </Section>
        {mergedListing.description}
        {'\n'}
        {type === 'movie' ? <TrendingMovieDetails details={details} /> : <TrendingTvDetails details={details} />}
        <TextDisplay>
          Watch Now (US): <Availability id={mergedListing.id} type={type} />
        </TextDisplay>
      </Container>
      <ItemActions id={mergedListing.id.toString()} type={type}>
        <Button onClick={onBack} label={backText ?? 'Back'} />

        {'videos' in details && (
          <>
            {details.external_ids.imdb_id && (
              <Button url={`https://www.imdb.com/title/${details.external_ids.imdb_id}`} label="View on IMDb" />
            )}
            {details.videos.results && findTrailer(details.videos.results) && (
              // TODO: fix this later
              // biome-ignore lint/style/noNonNullAssertion: known, need to fix
              <Button url={findTrailer(details.videos.results)!} label="View Latest Trailer" />
            )}
          </>
        )}

        <Button
          disabled={!canTrack}
          onClick={async () => {
            if (!interaction?.user.id) {
              return
            }

            const [dbErr, settings] = await unwrap(
              db.userTrackingSetting.findFirst({
                where: {
                  userId: interaction.user.id,
                },
              }),
            )

            if (dbErr) {
              botLogger.error(
                {
                  err: dbErr,
                },
                'Error loading tracking settings',
              )

              return await interaction.followUp({
                content: 'Error loading tracking settings',
                ephemeral: true,
              })
            }

            if (!settings) {
              return await interaction.followUp({
                content:
                  'No tracking settings found, please ensure to set up your `/tracking settings` before you can track listings.',
                ephemeral: true,
              })
            }

            let data: UserTrackingEntryData | null = null
            let notifyOn: string | null = null

            if (query.data?.type === 'movie') {
              if (!query.data.releaseDate) {
                return await interaction.followUp({
                  content: 'No release date found for this movie.',
                  ephemeral: true,
                })
              }

              data = {
                id: query.data.id,
                type: 'movie',
                releaseDate: query.data.releaseDate,
              }

              // biome-ignore lint/style/noNonNullAssertion: Expected
              notifyOn = data.releaseDate!
            } else if (query.data?.type === 'tv') {
              if (!query.data.details.next_episode_to_air) {
                return await interaction.followUp({
                  content: 'No next episode found for this TV show.',
                  ephemeral: true,
                })
              }

              const nextEpisode = query.data.details.next_episode_to_air as {
                id: number
                air_date: string
                episode_number: number
                season_number: number
                show_id: number
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

              // biome-ignore lint/style/noNonNullAssertion: Excepted here.
              notifyOn = data.episode!.airDate
            }

            if (!notifyOn || !data) {
              return await interaction.followUp({
                content: 'No compatible release date found for this item.',
                ephemeral: true,
              })
            }

            // check for existing

            const [existingErr, existing] = await unwrap(
              db.userTrackingEntry.findFirst({
                where: {
                  userId: interaction.user.id,
                  tmdbData: {
                    type: {
                      equals: data.type,
                    },
                    id: {
                      equals: data.id,
                    },
                  },
                },
              }),
            )

            if (existingErr) {
              botLogger.error({ err: existingErr })
              return await interaction.followUp({
                content: 'Error checking for existing tracking information.',
                ephemeral: true,
              })
            }

            if (existing) {
              return await interaction.followUp({
                content: 'You are already tracking this item.',
                ephemeral: true,
              })
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
              return await interaction.followUp({
                content: 'Error tracking this item.',
                ephemeral: true,
              })
            }

            return await interaction.followUp({
              content: 'You are now tracking this item.',
              ephemeral: true,
            })
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

function Availability({ type, id }: Readonly<{ type: 'movie' | 'tv'; id: number }>) {
  const query = useQuery({
    queryKey: ['availability', type, id],
    queryFn: () => getItemWatchProviders(type, { id, season: 1 }),
  })
  const [providerText, setProviderText] = useState('...')

  useEffect(() => {
    if (query.data?.results?.US?.flatrate?.length) {
      dedupeProviders(query.data.results.US.flatrate).then((text) => setProviderText(text))
    }
  }, [query.data?.results?.US?.flatrate])

  if (!query.data?.results) {
    return (
      <TextDisplay>
        {query.isLoading && '...'}
        {query.isError && 'Error Loading'}
      </TextDisplay>
    )
  }

  return (
    <TextDisplay>
      {query.data.results.US?.flatrate?.length && query.data.results.US.flatrate.length > 0
        ? providerText
        : 'Not Available'}
    </TextDisplay>
  )
}

async function dedupeProviders(
  providers: { logo_path?: string; provider_id: number; provider_name?: string; display_priority: number }[],
) {
  const filtered = providers.filter((p) => !DUPLICATE_PROVIDER_ID_MAPPING[p.provider_id] && p.provider_name)
  const sorted = filtered.sort((a, b) => a.display_priority - b.display_priority)

  return sorted.map((p) => p.provider_name).join(', ')
}

function findTrailer(results: MovieVideosResponse['results'] | TvVideosResponse['results']) {
  if (!results) {
    return null
  }

  const filtered = results?.filter(
    (r) => r.type === 'Trailer' && r.site === 'YouTube' && r.official && r.iso_3166_1 === 'US',
  )

  if (filtered.length === 0 || !filtered[0]?.key) {
    return null
  }

  return `https://youtube.com/watch?v=${filtered[0].key}`
}
