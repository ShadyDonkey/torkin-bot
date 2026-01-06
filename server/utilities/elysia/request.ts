// import type { TSchema } from '@sinclair/typebox'
// import { t } from 'elysia'

// export const PaginationQuerySchema = t.Object({
//   page: t.Optional(t.Number()),
//   limit: t.Optional(t.Number()),
// })

// export const PaginationQueryWithSortSchema = t.Intersect([
//   PaginationQuerySchema,
//   t.Object({
//     sortBy: t.String(),
//     sortDirection: t.Union([t.Literal('asc'), t.Literal('desc')]),
//   }),
// ])

// export const PaginatedSchema = <T extends TSchema>(itemSchema: T) =>
//   t.Object({
//     items: t.Array(itemSchema),
//     pagination: t.Object({
//       total: t.Number(),
//       page: t.Number(),
//       pageSize: t.Number(),
//       pageCount: t.Number(),
//       hasNext: t.Boolean(),
//       hasPrev: t.Boolean(),
//     }),
//   })

// export type PaginatedResponse<T extends TSchema> = ReturnType<typeof PaginatedSchema<T>>['static']

// export const ErrorSchema = t.Object({
//   errors: t.Array(t.String()),
// })
// export type ErrorResponse = typeof ErrorSchema.static

// export function parsePaginationQuery(query: { page?: number; limit?: number } | undefined) {
//   if (!query?.page || !query?.limit) {
//     return { limit: 10, offset: 0, page: 1 }
//   }

//   const limit = Math.min(Math.max(1, query.limit || 10), 10)
//   const offset = query.page ? (Math.max(1, query.page) - 1) * limit : 0
//   const page = Math.max(1, query.page || 1)

//   return { limit, offset, page }
// }
