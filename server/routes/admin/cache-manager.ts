import { Elysia } from 'elysia'
import Redis from 'ioredis'

const redis = new Redis(process.env.DRAGONFLY_URL || 'redis://localhost:6379')

export const cacheManager = new Elysia({ prefix: '/cache-manager' })
  .get('/', () => {
    return redis.info()
  })
  .get('/tree', async () => {
    const pattern = '*'
    const keys = await redis.keys(pattern)

    const items = await Promise.all(
      keys.map(async (key) => {
        const value = await redis.get(key)
        const ttl = await redis.ttl(key)

        let parsedValue: unknown = value

        try {
          if (value) {
            const parsed = JSON.parse(value)
            parsedValue = (parsed as { value?: unknown })?.value || parsed
          }
        } catch {}

        const cleanKey = key
          .replace(/^mrapi-cache::mrapi-cache:/, '')
          .replace(/^mrapi-rate-limiter::mrapi-rate-limiter:/, '')

        const parts = cleanKey.split(':')
        const baseCategory = parts[0] || 'other'

        let subgroup: string | undefined
        let keyWithoutCategory = parts.slice(1).join(':')

        if (baseCategory === 'rate-limit' && parts.length > 1) {
          subgroup = parts[1]
          keyWithoutCategory = parts.slice(2).join(':')
        }

        return {
          key: keyWithoutCategory,
          originalKey: key,
          category: baseCategory,
          subgroup,
          value: parsedValue,
          ttl: ttl > 0 ? ttl : null,
          found: !!value,
        }
      }),
    )

    const grouped = items.reduce(
      (acc, item) => {
        const { category, subgroup } = item
        acc[category] ??= {}

        if (subgroup) {
          acc[category].subgroups ??= {}
          acc[category].subgroups[subgroup] ??= []

          const { category: _, subgroup: __, ...itemWithoutMeta } = item
          acc[category].subgroups[subgroup].push(itemWithoutMeta)
        } else {
          acc[category].items ??= []
          const { category: _, subgroup: __, ...itemWithoutMeta } = item
          acc[category].items.push(itemWithoutMeta)
        }

        return acc
      },
      {} as Record<
        string,
        {
          items?: Array<Omit<(typeof items)[0], 'category' | 'subgroup'>>
          subgroups?: Record<string, Array<Omit<(typeof items)[0], 'category' | 'subgroup'>>>
        }
      >,
    )

    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .reduce(
        (acc, key) => {
          const group = grouped[key]
          if (group) {
            if (group.subgroups) {
              const sortedSubgroups = Object.keys(group.subgroups)
                .sort((a, b) => a.localeCompare(b))
                .reduce(
                  (subAcc, subKey) => {
                    const subGroup = group.subgroups?.[subKey]
                    if (subGroup) {
                      subAcc[subKey] = subGroup
                    }
                    return subAcc
                  },
                  {} as NonNullable<typeof group.subgroups>,
                )
              acc[key] = { ...group, subgroups: sortedSubgroups }
            } else {
              acc[key] = group
            }
          }
          return acc
        },
        {} as typeof grouped,
      )

    return {
      groups: sortedGrouped,
      totalKeys: items.length,
      categories: Object.keys(sortedGrouped),
    }
  })
