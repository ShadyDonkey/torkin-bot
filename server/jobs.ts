import { UTCDate } from '@date-fns/utc'
import { Cron, type CronOptions } from 'croner'
import { startOfDay } from 'date-fns'
import { createDM, createMessage } from 'dressed'
import pLimit from 'p-limit'
import { cache } from './lib/cache'
import { db } from './lib/db'
import { getDetails, getEpisodeDetails, CACHE_CONFIG as TMDB_CACHE_CONFIG } from './lib/tmdb'
import { availableWatchProviders, trending } from './lib/tmdb/api'
import type { StandardListing, TvEpisodeDetails } from './lib/tmdb/types'
import { unwrap } from './utilities'
import { logger } from './utilities/logger'

function protect(job: Cron) {
  logger.warn(`Job ${job.name} is blocked because a run is already in progress from ${job.currentRun()?.toISOString()}`)
}

function catchHandler(error: unknown, job: Cron) {
  logger.error({ error }, `Error occurred in ${job.name} job`)
}

const defaultOptions: CronOptions = {
  protect,
  catch: catchHandler,
  paused: true,
}

export const trendingJobs = {
  movie: {
    day: new Cron(
      '@daily',
      {
        name: 'fetch-movie-trending-day',
        ...defaultOptions,
      },
      async () => {
        const [responseErr, response] = await unwrap(trending('movie', 'day'))

        if (responseErr) {
          logger.error({ error: responseErr }, 'Error fetching trending movies in fetch-movie-trending-day job')
          return
        }

        if (!response.results) {
          logger.warn('No trending movies found in fetch-movie-trending-day job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(TMDB_CACHE_CONFIG.trending.key('movie', 'day'), response.results, TMDB_CACHE_CONFIG.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending movies in fetch-movie-trending-day job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending movies in fetch-movie-trending-day job')
          return
        }

        logger.info(`Successfully updated movie trending (day) cache with ${response.results.length} items`)
      },
    ),
    week: new Cron(
      '@daily',
      {
        name: 'fetch-movie-trending-week',
        ...defaultOptions,
      },
      async () => {
        const [responseErr, response] = await unwrap(trending('movie', 'week'))

        if (responseErr) {
          logger.error({ error: responseErr }, 'Error fetching trending movies in fetch-movie-trending-week job')
          return
        }

        if (!response.results) {
          logger.warn('No trending movies found in fetch-movie-trending-week job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(TMDB_CACHE_CONFIG.trending.key('movie', 'week'), response.results, TMDB_CACHE_CONFIG.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending movies in fetch-movie-trending-week job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending movies in fetch-movie-trending-week job')
          return
        }

        logger.info(`Successfully updated movie trending (week) cache with ${response.results.length} items`)
      },
    ),
  },
  tv: {
    day: new Cron(
      '@daily',
      {
        name: 'fetch-tv-trending-day',
        ...defaultOptions,
      },
      async () => {
        const [responseErr, response] = await unwrap(trending('tv', 'day'))

        if (responseErr) {
          logger.error({ error: responseErr }, 'Error fetching trending shows in fetch-tv-trending-day job')
          return
        }

        if (!response?.results) {
          logger.warn('No trending shows found in fetch-tv-trending-day job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(TMDB_CACHE_CONFIG.trending.key('tv', 'day'), response.results, TMDB_CACHE_CONFIG.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending shows in fetch-tv-trending-day job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending shows in fetch-tv-trending-day job')
          return
        }

        logger.info(`Successfully updated show trending (day) cache with ${response.results.length} items`)
      },
    ),
    week: new Cron(
      '@daily',
      {
        name: 'fetch-tv-trending-week',
        ...defaultOptions,
      },
      async () => {
        const [responseErr, response] = await unwrap(trending('tv', 'week'))

        if (responseErr) {
          logger.error({ error: responseErr }, 'Error fetching trending shows in fetch-tv-trending-week job')
          return
        }

        if (!response?.results) {
          logger.warn('No trending shows found in fetch-tv-trending-week job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(TMDB_CACHE_CONFIG.trending.key('tv', 'week'), response.results, TMDB_CACHE_CONFIG.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending shows in fetch-tv-trending-week job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending shows in fetch-tv-trending-week job')
          return
        }

        logger.info(`Successfully updated show trending (week) cache with ${response.results.length} items`)
      },
    ),
  },
}

const PROVIDER_JOB_CRON_PATTERN = '0 0 * * 0-6/2'

export const providerJobs = {
  regions: new Cron(
    PROVIDER_JOB_CRON_PATTERN,
    {
      name: 'fetch-available-watch-providers-regions',
      ...defaultOptions,
    },
    async () => {
      const [responseErr, response] = await unwrap(availableWatchProviders('regions'))

      if (responseErr) {
        logger.error({ error: responseErr }, 'Error fetching provider regions in fetch-provider-regions job')
        return
      }

      if (!response?.results) {
        logger.warn('No provider regions found in fetch-provider-regions job')
        return
      }

      const [cacheErr, cached] = await unwrap(
        cache.set(
          TMDB_CACHE_CONFIG.watchProviders.regions.key(),
          response.results,
          TMDB_CACHE_CONFIG.watchProviders.regions.ttl,
        ),
      )

      if (cacheErr) {
        logger.error({ error: cacheErr }, 'Error caching provider regions in fetch-provider-regions job')
        return
      }

      if (!cached) {
        logger.warn('Failed to cache provider regions in fetch-provider-regions job')
        return
      }

      logger.info(`Successfully updated provider regions cache with ${response.results.length} items`)
    },
  ),
  movie: new Cron(
    PROVIDER_JOB_CRON_PATTERN,
    {
      name: 'fetch-available-watch-providers-movie',
      ...defaultOptions,
    },
    async () => {
      const [responseErr, response] = await unwrap(availableWatchProviders('movie'))

      if (responseErr) {
        logger.error({ error: responseErr }, 'Error fetching provider movie in fetch-provider-movie job')
        return
      }

      if (!response?.results) {
        logger.warn('No provider movie found in fetch-provider-movie job')
        return
      }

      const [cacheErr, cached] = await unwrap(
        cache.set(
          TMDB_CACHE_CONFIG.watchProviders.movie.key(),
          response.results,
          TMDB_CACHE_CONFIG.watchProviders.movie.ttl,
        ),
      )

      if (cacheErr) {
        logger.error({ error: cacheErr }, 'Error caching provider movie in fetch-provider-movie job')
        return
      }

      if (!cached) {
        logger.warn('Failed to cache provider movie in fetch-provider-movie job')
        return
      }

      logger.info(`Successfully updated provider movie cache with ${response.results.length} items`)
    },
  ),
  tv: new Cron(
    PROVIDER_JOB_CRON_PATTERN,
    {
      name: 'fetch-available-watch-providers-tv',
      ...defaultOptions,
    },
    async () => {
      const [responseErr, response] = await unwrap(availableWatchProviders('tv'))

      if (responseErr) {
        logger.error({ error: responseErr }, 'Error fetching provider tv in fetch-provider-tv job')
        return
      }

      if (!response?.results) {
        logger.warn('No provider tv found in fetch-provider-tv job')
        return
      }

      const [cacheErr, cached] = await unwrap(
        cache.set(TMDB_CACHE_CONFIG.watchProviders.tv.key(), response.results, TMDB_CACHE_CONFIG.watchProviders.tv.ttl),
      )

      if (cacheErr) {
        logger.error({ error: cacheErr }, 'Error caching provider tv in fetch-provider-tv job')
        return
      }

      if (!cached) {
        logger.warn('Failed to cache provider tv in fetch-provider-tv job')
        return
      }

      logger.info(`Successfully updated provider tv cache with ${response.results.length} items`)
    },
  ),
}

const trackingNotification = new Cron(
  '10 * * * *',
  {
    name: 'user-item-tracking-notification',
    ...defaultOptions,
  },
  async () => {
    const currentHour = new UTCDate().getUTCHours()
    const today = startOfDay(new UTCDate())

    const users = await db.userTrackingSetting.findMany({
      where: {
        notificationHour: currentHour,
      },
    })

    if (users.length < 1) {
      logger.info('No users to notify')
      return
    }

    const promises = users.map(async (user) => {
      let dmChannelId = user.dmChannelId

      if (!dmChannelId) {
        logger.warn(`User ${user.userId} has no dm channel id, need to create one.`)
        const [channelErr, channel] = await unwrap(createDM(user.userId))

        if (channelErr) {
          logger.error({ error: channelErr }, 'Error creating dm channel for user')
          return
        }

        dmChannelId = channel.id

        const [updateErr] = await unwrap(
          db.userTrackingSetting.update({
            where: { userId: user.userId },
            data: { dmChannelId: channel.id },
          }),
        )

        if (updateErr) {
          logger.error({ error: updateErr }, 'Error updating user tracking setting')
        }
      }

      const trackedEntriesToday = await db.userTrackingEntry.findMany({
        where: {
          userId: user.userId,
          notifyDate: {
            lte: today,
          },
          notified: false,
        },
      })

      if (trackedEntriesToday.length < 1) {
        return
      }

      let message = 'Howdy! Here is your tracking update for today:\n\n'
      const movieGroup: StandardListing<'movie'>[] = []
      const tvGroup: {
        listing: StandardListing<'tv'>
        episode: TvEpisodeDetails
      }[] = []

      const movieIds = new Set<string>()
      const tvIds = new Set<string>()

      for (const entry of trackedEntriesToday) {
        if (entry.tmdbData.type === 'movie') {
          movieIds.add(entry.id)

          const [err, item] = await unwrap(getDetails('movie', entry.tmdbData.id))

          if (err) {
            logger.error({ err, userId: user.userId }, 'Error getting details for movie')
            continue
          }

          movieGroup.push(item as StandardListing<'movie'>)
        } else if (entry.tmdbData.type === 'tv') {
          tvIds.add(entry.id)

          if (!entry.tmdbData.episode) {
            continue
          }

          const [err, item] = await unwrap(getDetails('tv', entry.tmdbData.id))

          if (err) {
            logger.error({ err, userId: user.userId }, 'Error getting details for tv')
            continue
          }

          const [episodeErr, episode] = await unwrap(
            getEpisodeDetails(
              entry.tmdbData.id,
              entry.tmdbData.episode.seasonNumber,
              entry.tmdbData.episode.episodeNumber,
            ),
          )

          if (episodeErr) {
            logger.error({ err: episodeErr, userId: user.userId }, 'Error getting episode details')
            continue
          }

          tvGroup.push({
            listing: item as StandardListing<'tv'>,
            episode,
          })
        }
      }

      message += '**Movie Releases**\n'
      for (const movie of movieGroup) {
        message += `- ${movie.title}\n`
      }

      message += '\n**TV Episodes**\n'
      for (const tv of tvGroup) {
        message += `- ${tv.listing.title} - ${tv.episode.name}\n`
      }

      if (message.length > 1800) {
        message = `${message.slice(0, 1800)}\n\n_And more..._`
      }

      const [dmErr] = await unwrap(
        createMessage(dmChannelId, {
          content: message,
        }),
      )

      if (dmErr) {
        logger.error({ err: dmErr, userId: user.userId }, 'Error sending message to user')
        return
      }

      const [movieDeleteErr] = await unwrap(
        db.userTrackingEntry.deleteMany({
          where: {
            userId: user.userId,
            id: {
              in: Array.from(movieIds),
            },
            notifyDate: {
              lte: today,
            },
          },
        }),
      )

      if (movieDeleteErr) {
        logger.error({ err: movieDeleteErr, userId: user.userId }, 'Error deleting movie tracking entries')
      }

      const [tvMarkedErr] = await unwrap(
        db.userTrackingEntry.updateMany({
          where: {
            userId: user.userId,
            id: {
              in: Array.from(tvIds),
            },
            notifyDate: {
              lte: today,
            },
          },
          data: {
            notified: true,
          },
        }),
      )

      if (tvMarkedErr) {
        logger.error({ err: tvMarkedErr, userId: user.userId }, 'Error marking TV tracking entries as notified')
      }
    })

    const chunkSize = Math.ceil(promises.length / 5)
    const chunks = Array.from({ length: 5 }, (_, i) => promises.slice(i * chunkSize, (i + 1) * chunkSize))

    const CONCURRENCY_PER_BATCH = 2
    const limit = pLimit(CONCURRENCY_PER_BATCH)

    await Promise.all(
      chunks.map(async (chunk) => {
        const promises = chunk.map((p) => limit(() => p))
        await Promise.allSettled(promises)
      }),
    )
  },
)

export const startJobs = (triggerNow = false) => {
  for (const job of Object.values(providerJobs)) {
    if (!job.isBusy() && !job.isRunning()) {
      resume(job, triggerNow)
    }
  }

  for (const group of Object.values(trendingJobs)) {
    for (const job of Object.values(group)) {
      resume(job, triggerNow)
    }
  }

  resume(trackingNotification, false)
}

function resume(job: Cron, triggerNow: boolean) {
  if (!job.isBusy() && !job.isRunning()) {
    logger.debug(`Resuming job ${job.name}`)
    const resumed = job.resume()

    if (resumed) {
      logger.info(`Job ${job.name} resumed`)

      if (triggerNow) {
        logger.info(`Triggering job ${job.name}`)
        job.trigger()
      }
    } else {
      logger.warn(`Job ${job.name} is already running or busy`)
    }
  }
}
