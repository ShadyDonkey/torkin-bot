import { ActionRow, Button, Section, Thumbnail } from '@dressed/react'
import { format } from 'date-fns'
import { bold, h3, subtext } from 'discord-fmt'
import { getImageUrl } from '@/server/lib/tmdb'

export function PaginationButtons({
  currentPage,
  prefix,
  totalPages,
  disabled,
}: Readonly<{
  currentPage: number
  prefix: string
  totalPages?: number
  disabled?: boolean
}>) {
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <ActionRow>
      <Button custom_id={`${prefix}-goto-1-first`} label="⏮" disabled={isFirstPage || disabled} style="Secondary" />
      <Button custom_id={`${prefix}-goto-${currentPage - 1}-prev`} label="◀" disabled={isFirstPage || disabled} />
      <Button
        custom_id={`${prefix}-activepage`}
        label={`${currentPage} / ${totalPages ?? '?'}`}
        style="Secondary"
        disabled
      />
      <Button custom_id={`${prefix}-goto-${currentPage + 1}-next`} label="▶" disabled={isLastPage || disabled} />
      <Button
        custom_id={`${prefix}-goto-${totalPages}-last`}
        label="⏭"
        disabled={isLastPage || disabled}
        style="Secondary"
      />
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

export function ListingPreview({
  linkId,
  title,
  subtitle,
  description,
  releaseDate,
  thumbnail,
}: Readonly<{
  linkId: string
  title?: string
  subtitle?: string
  description?: string
  releaseDate?: string
  thumbnail?: string
}>) {
  return (
    <>
      <Section accessory={<Button custom_id={linkId} label="View Details" style="Secondary" />}>
        {(subtitle ? bold : h3)(
          `${title ?? 'Unknown'} (${releaseDate ? format(new Date(releaseDate), 'yyyy') : 'Not Released'})`,
        )}
        {'\n'}
        {subtitle?.length && subtext(subtitle)}
      </Section>
      {(description || thumbnail) && (
        <Section
          accessory={<Thumbnail media={thumbnail?.startsWith('http') ? thumbnail : getImageUrl(thumbnail ?? '')} />}
        >
          {description ? `${description.substring(0, 255)}` : '‎'}
          {description && description.length > 255 && '...'}
        </Section>
      )}
    </>
  )
}
