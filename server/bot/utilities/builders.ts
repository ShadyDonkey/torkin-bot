import { ActionRow, Button } from 'dressed'

export function buildPaginationButtons(currentPage: number, totalPages: number, prefix: string) {
  const JUMP_TO_FIRST = currentPage !== 1
  const JUMP_TO_LAST = currentPage !== totalPages
  const PREVIOUS_PAGE = currentPage !== 1
  const NEXT_PAGE = currentPage !== totalPages

  return ActionRow(
    Button({
      custom_id: `${prefix}-goto-1-first`,
      label: '«',
      disabled: !JUMP_TO_FIRST,
      style: 'Primary',
    }),

    Button({
      custom_id: `${prefix}-goto-${currentPage - 1}-prev`,
      label: '‹',
      disabled: !PREVIOUS_PAGE,
      style: 'Primary',
    }),

    Button({
      custom_id: `${prefix}-activepage`,
      label: `${currentPage} / ${totalPages}`,
      disabled: true,
      style: 'Secondary',
    }),

    Button({
      custom_id: `${prefix}-goto-${currentPage + 1}-next`,
      label: '›',
      disabled: !NEXT_PAGE,
      style: 'Primary',
    }),

    Button({
      custom_id: `${prefix}-goto-${totalPages}-last`,
      label: '»',
      disabled: !JUMP_TO_LAST,
      style: 'Primary',
    }),
  )
}

export function buildItemActions(id: string) {
  // actions: add to watchlist
  return [
    ActionRow(
      Button({
        custom_id: `action-watchlist-add-${id}-default`,
        label: 'Add to Watchlist',
        style: 'Secondary',
      }),
    ),
  ]
}
