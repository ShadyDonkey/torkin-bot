import { ActionRow, Button } from 'dressed'

export function buildPaginationButtons(currentPage: number, totalPages: number) {
  const JUMP_TO_FIRST = currentPage !== 1
  const JUMP_TO_LAST = currentPage !== totalPages
  const PREVIOUS_PAGE = currentPage !== 1
  const NEXT_PAGE = currentPage !== totalPages

  return ActionRow(
    Button({
      custom_id: 'find-goto-1',
      label: '«',
      disabled: !JUMP_TO_FIRST,
      style: 'Secondary',
    }),

    Button({
      custom_id: `find-goto-${currentPage - 1}`,
      label: '‹',
      disabled: !PREVIOUS_PAGE,
      style: 'Secondary',
    }),

    Button({
      custom_id: 'find-activepage',
      label: `${currentPage.toString()} / ${totalPages.toString()}`,
      disabled: true,
      style: 'Primary',
    }),

    Button({
      custom_id: `find-goto-${currentPage + 1}`,
      label: '›',
      disabled: !NEXT_PAGE,
      style: 'Secondary',
    }),

    Button({
      custom_id: `find-goto-${totalPages}`,
      label: '»',
      disabled: !JUMP_TO_LAST,
      style: 'Secondary',
    }),
  )
}
