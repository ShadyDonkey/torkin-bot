import { Cron } from 'croner'
import { cache } from '@/server/lib/cache'
import { CACHE_CONFIG as TMDB_CACHE_CONFIG } from '@/server/lib/tmdb'
import { trending } from '@/server/lib/tmdb/api'
import { unwrap } from '@/server/utilities'
import { logger } from '@/server/utilities/logger'

logger.info('Starting scheduled jobs')

export const trendingJobs = {
  movie: {
    day: new Cron(
      '@daily',
      {
        name: 'fetch-movie-trending-day',
        protect,
        catch: catchHandler,
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
        protect,
        catch: catchHandler,
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
        protect,
        catch: catchHandler,
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
        protect,
        catch: catchHandler,
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

function protect(job: Cron) {
  logger.warn(`Job ${job.name} is blocked because a run is already in progress from ${job.currentRun()?.toISOString()}`)
}

function catchHandler(error: unknown, job: Cron) {
  logger.error({ error }, `Error occurred in ${job.name} job`)
}
