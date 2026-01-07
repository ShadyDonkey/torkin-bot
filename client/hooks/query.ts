import { nprogress } from '@mantine/nprogress'
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ref } from 'react'
import { handleApiResponseWithToast, sendApiRequest } from '../lib/api'

export const QUERY_KEYS = {} as const

export function useApiQuery<T>(
  queryKey: string | string[],
  // biome-ignore lint/suspicious/noExplicitAny: need to fix later
  apiCall: () => Promise<any>,
  errorMessage: string,
  options?: Partial<UseQueryOptions>,
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const response = await sendApiRequest(apiCall())
      const result = handleApiResponseWithToast<T>(response, errorMessage)

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(errorMessage)
    },
    staleTime: 300_000, // 5m default
    ...options,
  })

  return {
    data: data as Ref<T | undefined>,
    isLoading,
    error,
    refetch,
  }
}

export function useApiMutation<T, V = void>(
  // biome-ignore lint/suspicious/noExplicitAny: need to fix later
  mutationFn: (variables: V) => Promise<any>,
  options: {
    successMessage?: string
    errorMessage?: string
    invalidateQueries?: string[]
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
    onSettled?: () => void
  },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: V) => {
      nprogress.start()
      const response = await sendApiRequest(mutationFn(variables))
      const result = handleApiResponseWithToast<T>(response, options.errorMessage, options.successMessage)

      nprogress.complete()

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(options.errorMessage)
    },
    onSuccess: (data: T) => {
      if (options?.invalidateQueries && options.invalidateQueries.length > 0) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })
      }

      nprogress.complete()
      options?.onSuccess?.(data)
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  })
}
