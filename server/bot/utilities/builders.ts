import type { APIComponentInMessageActionRow } from 'discord-api-types/v10'
import { ActionRow, Button } from 'dressed'

export function buildPaginationButtons(currentPage: number, totalPages: number, prefix: string) {
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return ActionRow(
    Button({ custom_id: `${prefix}-goto-1-first`, label: '⏮', disabled: isFirstPage, style: 'Secondary' }),
    Button({ custom_id: `${prefix}-goto-${currentPage - 1}-prev`, label: '◀', disabled: isFirstPage }),
    Button({
      custom_id: `${prefix}-activepage`,
      label: `${currentPage} / ${totalPages}`,
      style: 'Secondary',
      disabled: true,
    }),
    Button({ custom_id: `${prefix}-goto-${currentPage + 1}-next`, label: '▶', disabled: isLastPage }),
    Button({ custom_id: `${prefix}-goto-${totalPages}-last`, label: '⏭', disabled: isLastPage, style: 'Secondary' }),
  )
}

export function buildItemActions(id: string, type: 'movie' | 'tv', additional: APIComponentInMessageActionRow[] = []) {
  return ActionRow(
    ...additional,
    Button({
      custom_id: `action-watchlist-add-${id}-${type}-default`,
      label: 'Add to Watchlist',
      style: 'Secondary',
    }),
  )
}
