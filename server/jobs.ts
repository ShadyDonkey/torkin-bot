import { Cron } from 'croner'
import { CACHE_CONFIG, cache } from '@/server/lib/cache'
import { requestTrendingMovies, requestTrendingTv } from '@/server/lib/tmdb/helpers'
import { unwrap } from '@/server/utilities'
import { logger } from '@/server/utilities/logger'

logger.info('Starting scheduled jobs')

export const trendingJobs = {
  movie: {
    day: new Cron(
      '@daily',
      {
        name: 'fetch-movie-trending-day',
        protect: true,
        catch: (err) => {
          logger.error({ error: err }, 'Error in fetch-movie-trending-day job')
        },
      },
      async () => {
        const [resultErr, results] = await unwrap(requestTrendingMovies('day'))

        if (resultErr) {
          logger.error({ error: resultErr }, 'Error fetching trending movies in fetch-movie-trending-day job')
          return
        }

        if (!results?.length) {
          logger.warn('No trending movies found in fetch-movie-trending-day job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(CACHE_CONFIG.lib.tmdb.trending.key('movie', 'day'), results, CACHE_CONFIG.lib.tmdb.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending movies in fetch-movie-trending-day job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending movies in fetch-movie-trending-day job')
          return
        }

        logger.info(`Successfully updated movie trending (day) cache with ${results.length} items`)
      },
    ),
    week: new Cron(
      '@daily',
      {
        name: 'fetch-movie-trending-week',
        protect: true,
        catch: (err) => {
          logger.error({ error: err }, 'Error in fetch-movie-trending-week job')
        },
      },
      async () => {
        const [resultErr, results] = await unwrap(requestTrendingMovies('week'))

        if (resultErr) {
          logger.error({ error: resultErr }, 'Error fetching trending movies in fetch-movie-trending-week job')
          return
        }

        if (!results?.length) {
          logger.warn('No trending movies found in fetch-movie-trending-week job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(CACHE_CONFIG.lib.tmdb.trending.key('movie', 'week'), results, CACHE_CONFIG.lib.tmdb.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending movies in fetch-movie-trending-week job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending movies in fetch-movie-trending-week job')
          return
        }

        logger.info(`Successfully updated movie trending (week) cache with ${results.length} items`)
      },
    ),
  },
  tv: {
    day: new Cron(
      '@daily',
      {
        name: 'fetch-tv-trending-day',
        protect: true,
        catch: (err) => {
          logger.error({ error: err }, 'Error in fetch-tv-trending-day job')
        },
      },
      async () => {
        const [resultErr, results] = await unwrap(requestTrendingTv('day'))

        if (resultErr) {
          logger.error({ error: resultErr }, 'Error fetching trending shows in fetch-tv-trending-day job')
          return
        }

        if (!results?.length) {
          logger.warn('No trending shows found in fetch-tv-trending-day job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(CACHE_CONFIG.lib.tmdb.trending.key('tv', 'day'), results, CACHE_CONFIG.lib.tmdb.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending shows in fetch-tv-trending-day job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending shows in fetch-tv-trending-day job')
          return
        }

        logger.info(`Successfully updated show trending (day) cache with ${results.length} items`)
      },
    ),
    week: new Cron(
      '@daily',
      {
        name: 'fetch-tv-trending-week',
        protect: true,
        catch: (err) => {
          logger.error({ error: err }, 'Error in fetch-tv-trending-week job')
        },
      },
      async () => {
        const [resultErr, results] = await unwrap(requestTrendingTv('week'))

        if (resultErr) {
          logger.error({ error: resultErr }, 'Error fetching trending shows in fetch-tv-trending-week job')
          return
        }

        if (!results?.length) {
          logger.warn('No trending shows found in fetch-tv-trending-week job')
          return
        }

        const [cacheErr, cached] = await unwrap(
          cache.set(CACHE_CONFIG.lib.tmdb.trending.key('tv', 'week'), results, CACHE_CONFIG.lib.tmdb.trending.ttl),
        )

        if (cacheErr) {
          logger.error({ error: cacheErr }, 'Error caching trending shows in fetch-tv-trending-week job')
          return
        }

        if (!cached) {
          logger.warn('Failed to cache trending shows in fetch-tv-trending-week job')
          return
        }

        logger.info(`Successfully updated show trending (week) cache with ${results.length} items`)
      },
    ),
  },
}
