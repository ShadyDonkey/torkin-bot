import { treaty } from '@elysiajs/eden'
import { notifications } from '@mantine/notifications'
import { createIsomorphicFn } from '@tanstack/react-start'
import type { App } from '../../server/main'
import { unwrap } from '../utilities'

export const getTreaty = createIsomorphicFn().client(() =>
  treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    fetch: {
      credentials: 'include',
    },
  }),
)

export async function sendApiRequest<T>(promise: Promise<T>, errorMessage = 'Request failed'): Promise<T> {
  const [error, data] = await unwrap<T>(promise)

  if (error || !data) {
    notifications.show({ message: error?.message || errorMessage, color: 'red' })

    throw new Error(error?.message || errorMessage)
  }

  return data
}

export function handleApiResponse<T>(response: { data?: unknown; error?: unknown }, errorMessage?: string) {
  if (response.error) {
    const entries = Object.entries(response.error)
    let errors = [errorMessage || 'Request failed']

    // biome-ignore lint/style/noNonNullAssertion: This is safe because we are checking if the entry exists
    if (entries.at(1) && entries.at(1)?.at(0) === 'value' && 'errors' in entries.at(1)!.at(1)) {
      errors = entries.at(1)?.at(1)?.errors || errors
    }

    return { success: false, errors, data: null }
  }

  return { success: true, data: response.data as T, errors: null }
}

export function handleApiResponseWithToast<T>(
  response: { data?: unknown; error?: unknown },
  errorMessage?: string,
  successMessage?: string,
) {
  const result = handleApiResponse<T>(response, errorMessage)

  if (result.success) {
    if (successMessage) {
      notifications.show({ message: successMessage, color: 'green' })
    }
  } else {
    notifications.show({ message: result.errors?.[0] || 'Request failed', color: 'red' })
  }

  return result
}
