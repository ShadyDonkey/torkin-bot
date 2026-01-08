import { ActionIcon, Box, Center, Container, Grid, Stack, Text, Title } from '@mantine/core'
import { useThrottledState } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { QUERY_KEYS, useApiQuery } from 'hooks/query'
import { getTreaty } from 'lib/api'
import { RefreshCwIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export const Route = createFileRoute('/admin/cache-manager')({
  component: CacheManager,
})

type CacheItem = {
  key: string
  originalKey: string
  value: unknown
  ttl: number | null
  found: boolean
}

type CacheGroup = {
  items?: CacheItem[]
  subgroups?: Record<string, CacheItem[]>
}

type CacheResponse = {
  groups: Record<string, CacheGroup>
  totalKeys: number
  categories: string[]
}

function CacheManager() {
  const {
    data: cacheTree,
    isLoading: isCacheTreeLoading,
    refetch: refetchCache,
  } = useApiQuery<CacheResponse>(
    QUERY_KEYS.ADMIN.CACHE_MANAGER_RESULTS,
    () => getTreaty().admin['cache-manager'].tree.get(),
    'Failed to fetch cache manager results',
  )

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedSubgroup, setSelectedSubgroup] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<CacheItem | null>(null)
  const [query, setQuery] = useThrottledState('', 1000)
  const items = useMemo(() => {
    if (!cacheTree || !selectedGroup) {
      return []
    }

    const group = cacheTree.groups[selectedGroup]
    const items = selectedSubgroup ? (group.subgroups?.[selectedSubgroup] ?? []) : (group.items ?? [])

    if (!query) {
      return items
    }

    return items.filter(
      (item) =>
        item.key.toLowerCase().includes(query.toLowerCase()) ||
        item.originalKey.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(item.value).toLowerCase().includes(query.toLowerCase()),
    )
  }, [cacheTree, selectedGroup, query, selectedSubgroup])

  const getGroupCount = (groupName: string) => {
    const group = cacheTree?.groups[groupName]

    if (!group) {
      return 0
    }

    let count = group.items?.length || 0

    if (group.subgroups) {
      count += Object.values(group.subgroups).reduce((acc, subgroup) => acc + subgroup.length, 0)
    }

    return count
  }

  const selectGroup = (groupName: string) => {
    setSelectedGroup(groupName)
    setSelectedSubgroup(null)
    setSelectedItem(null)
  }

  const selectSubgroup = (groupName: string, subgroupName: string) => {
    setSelectedGroup(groupName)
    setSelectedSubgroup(subgroupName)
    setSelectedItem(null)
  }

  if (isCacheTreeLoading) {
    return <div>Loading...</div>
  }

  return (
    <Box mih="100%" miw="100%">
      <Grid>
        <Grid.Col span={4}>
          <Stack>
            <Grid justify="space-between" align="center">
              <Grid.Col span={10}>
                <Title order={4}>Cache Manager</Title>
              </Grid.Col>
              <Grid.Col span={2}>
                <ActionIcon variant="filled" aria-label="Settings" onClick={() => refetchCache()}>
                  <RefreshCwIcon size={14} />
                </ActionIcon>
              </Grid.Col>
            </Grid>

            <Text>T</Text>
            <Text>T</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={4}>A</Grid.Col>
        <Grid.Col span={4}>S</Grid.Col>
      </Grid>
    </Box>
  )
}

function formatTTL(ttl: number | null) {
  if (ttl === null) {
    return 'No expiry'
  }
  if (ttl < 60) {
    return `${ttl}s`
  }
  if (ttl < 3600) {
    return `${Math.floor(ttl / 60)}m ${ttl % 60}s`
  }
  if (ttl < 86400) {
    return `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`
  }

  return `${Math.floor(ttl / 86400)}d ${Math.floor((ttl % 86400) / 3600)}h`
}

function formatValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value, null, 2)
}
