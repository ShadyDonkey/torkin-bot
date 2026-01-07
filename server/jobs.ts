import { Cron, type CronOptions } from 'croner'
import { cache } from './lib/cache'
import { CACHE_CONFIG as TMDB_CACHE_CONFIG } from './lib/tmdb'
import { availableWatchProviders, trending } from './lib/tmdb/api'
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
