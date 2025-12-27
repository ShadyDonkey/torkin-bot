import { ActionRow, Button } from '@dressed/react'

export function PaginationButtons({
  currentPage,
  prefix,
  totalPages,
}: Readonly<{
  currentPage: number
  prefix: string
  totalPages: number
}>) {
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <ActionRow>
      <Button custom_id={`${prefix}-goto-1-first`} label="⏮" disabled={isFirstPage} style="Secondary" />
      <Button custom_id={`${prefix}-goto-${currentPage - 1}-prev`} label="◀" disabled={isFirstPage} />
      <Button custom_id={`${prefix}-activepage`} label={`${currentPage} / ${totalPages}`} style="Secondary" disabled />
      <Button custom_id={`${prefix}-goto-${currentPage + 1}-next`} label="▶" disabled={isLastPage} />
      <Button custom_id={`${prefix}-goto-${totalPages}-last`} label="⏭" disabled={isLastPage} style="Secondary" />
    </ActionRow>
  )
}

export function ItemActions({
  id,
  type,
  children = [],
}: Readonly<{
  id: string
  type: 'movie' | 'tv'
  children?: React.ReactNode
}>) {
  return (
    <ActionRow>
      {children}
      <Button custom_id={`action-watchlist-add-${id}-${type}-default`} label="Add to Watchlist" style="Secondary" />
    </ActionRow>
  )
}

export function BackButton({
  page,
  prefix,
  title,
  ...props
}: Readonly<{ page?: string; prefix: string; title: string; style?: 'Secondary'; label?: string }>) {
  return <Button custom_id={`${prefix}-goto-${page ?? 1}-back`} label={page ? 'Back' : `See all ${title}`} {...props} />
}
