import type { MessageComponentInteraction } from '@dressed/react'
import { ActionRow, Button, Section, Thumbnail } from '@dressed/react'
import { format } from 'date-fns'
import { bold, h3, subtext } from 'discord-fmt'
import { getImageUrl } from '@/server/lib/tmdb'

export function PaginationButtons({
  currentPage,
  totalPages,
  setPage,
}: Readonly<{
  currentPage: number
  totalPages?: number
  setPage?: React.Dispatch<React.SetStateAction<number>>
}>) {
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <ActionRow>
      <Button onClick={() => setPage?.(1)} label="⏮" disabled={isFirstPage || !setPage} style="Secondary" />
      <Button onClick={() => setPage?.(currentPage - 1)} label="◀" disabled={isFirstPage || !setPage} />
      <Button custom_id="activepage" label={`${currentPage} / ${totalPages ?? '?'}`} style="Secondary" disabled />
      <Button onClick={() => setPage?.(currentPage + 1)} label="▶" disabled={isLastPage || !setPage} />
      <Button
        onClick={() => setPage?.(totalPages ?? 1)}
        label="⏭"
        disabled={isLastPage || !setPage}
        style="Secondary"
      />
    </ActionRow>
  )
}

export function ItemActions({
  // id,
  // type,
  children = [],
}: Readonly<{
  id: string
  type: 'movie' | 'tv'
  children?: React.ReactNode
}>) {
  return (
    <ActionRow>
      {children}
      {/* Removing because we're disabling watchlists for now */}
      {/* <Button custom_id={`action-watchlist-add-${id}-${type}-default`} label="Add to Watchlist" style="Secondary" /> */}
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
  title,
  subtitle,
  description,
  releaseDate,
  thumbnail,
  ...props
}: Readonly<
  {
    title?: string
    subtitle?: string
    description?: string
    releaseDate?: string
    thumbnail?: string
  } & ({ linkId: string } | { onClick: (interaction: MessageComponentInteraction<'Button'>) => void })
>) {
  return (
    <>
      <Section
        accessory={
          <Button
            custom_id=""
            {...('linkId' in props ? { custom_id: props.linkId } : { onClick: props.onClick })}
            label="Show Details"
            style="Secondary"
          />
        }
      >
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
