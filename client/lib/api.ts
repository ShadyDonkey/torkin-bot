import { treaty } from '@elysiajs/eden'
import { notifications } from '@mantine/notifications'
import { createIsomorphicFn } from '@tanstack/react-start'
import { type App, app } from '../../server/main'
import { unwrap } from '../utilities'

export const getTreaty = createIsomorphicFn()
  .server(() => treaty(app))
  .client(() =>
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
    const errorObj = response.error as { errors?: string[] }
    const errors = errorObj.errors || [errorMessage || 'Request failed']
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
