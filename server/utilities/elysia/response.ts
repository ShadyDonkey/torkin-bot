/** biome-ignore-all lint/suspicious/noExplicitAny: generic handlers, should allow any */
import type { Static, TSchema } from '@sinclair/typebox'
import camelcaseKeys from 'camelcase-keys'
import { type ErrorResponse, ErrorSchema, type PaginatedResponse } from './request'

export const RESPONSE_ERRORS = {
  500: ErrorSchema,
}

export function createResponseSchema<T extends TSchema>(
  successType: T,
): {
  200: T
  [key: number]: typeof ErrorSchema | T
} {
  return {
    ...RESPONSE_ERRORS,
    200: successType,
  }
}

export function createErrorRes(
  message: string | string[],
  status?: (code: number, reason: string) => void,
  code: number | { code: number; reason?: string } = 200,
): ErrorResponse {
  if (status) {
    if (typeof code === 'object') {
      status(code.code, code.reason ?? 'Internal Server Error')
    } else {
      status(code, 'Internal Server Error')
    }
  }

  return {
    errors: Array.isArray(message) ? message : [message],
  }
}

export function createSuccessRes<T>(
  data: any,
  status?: (code: number, reason: string) => void,
  code: number | { code: number; reason?: string } = 200,
): T {
  if (status) {
    if (typeof code === 'object') {
      status(code.code, code.reason ?? 'OK')
    } else {
      status(code, 'OK')
    }
  }

  if (!Array.isArray(data)) {
    switch (typeof data) {
      case 'string':
        break
      case 'object':
        data = camelcaseKeys(data, { deep: true })
        break
      default:
        data = { message: String(data) }
        break
    }
  }

  return data
}

export function createPaginatedRes<T extends TSchema>(
  data: any,
  page: number,
  limit: number,
  total: number,
  options: {
    maxPageSize?: number
    minPageSize?: number
    transformItem?: (item: any) => Static<T>
    skipCamelCase?: boolean
  } = {},
  set?: any,
  statusCode?: number,
): PaginatedResponse<T> {
  if (set && statusCode) {
    set.status = statusCode
  }

  const { maxPageSize = 100, minPageSize = 1, transformItem, skipCamelCase = false } = options
  const {
    page: validPage,
    limit: validLimit,
    total: validTotal,
  } = validatePaginationParams(page, limit, total, maxPageSize, minPageSize)

  const paginationMeta = calculatePaginationMeta(validPage, validLimit, validTotal)
  const items: Static<T>[] = []

  if (Array.isArray(data)) {
    for (const item of data) {
      let processedItem: Static<T>

      if (transformItem) {
        processedItem = transformItem(item)
      } else if (typeof item === 'object' && item !== null && !skipCamelCase) {
        processedItem = camelcaseKeys(item, { deep: true }) as Static<T>
      } else {
        processedItem = item as Static<T>
      }

      items.push(processedItem)
    }
  } else if (data != null) {
    let processedItem: Static<T>

    if (transformItem) {
      processedItem = transformItem(data)
    } else if (typeof data === 'object' && !skipCamelCase) {
      processedItem = camelcaseKeys(data, { deep: true }) as Static<T>
    } else {
      processedItem = data as Static<T>
    }

    items.push(processedItem)
  }

  return {
    items,
    pagination: {
      total: paginationMeta.total,
      page: paginationMeta.page,
      pageSize: paginationMeta.pageSize,
      pageCount: paginationMeta.pageCount,
      hasNext: paginationMeta.hasNext,
      hasPrev: paginationMeta.hasPrev,
    },
  }
}

export function createEmptyPaginatedRes<T extends TSchema>(
  page = 1,
  limit = 10,
  set?: any,
  statusCode?: number,
): PaginatedResponse<T> {
  if (set && statusCode) {
    set.status = statusCode
  }

  return createPaginatedRes<T>([], page, limit, 0)
}

function validatePaginationParams(
  page: number,
  limit: number,
  total: number,
  maxPageSize = 100,
  minPageSize = 1,
): { page: number; limit: number; total: number } {
  const normalizedTotal = Math.max(0, Math.floor(total))
  const normalizedLimit = Math.max(minPageSize, Math.min(maxPageSize, Math.floor(limit)))
  let normalizedPage = Math.max(1, Math.floor(page))

  if (normalizedTotal > 0) {
    const maxPage = Math.ceil(normalizedTotal / normalizedLimit)
    normalizedPage = Math.min(normalizedPage, maxPage)
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total: normalizedTotal,
  }
}

function calculatePaginationMeta(page: number, pageSize: number, total: number) {
  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 0

  return {
    page,
    pageSize,
    total,
    pageCount,
    hasNext: page < pageCount,
    hasPrev: page > 1,
  }
}
