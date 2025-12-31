import { Container, Separator } from '@dressed/react'
import { h1 } from 'discord-fmt'
import type { ReactNode } from 'react'

export default function ErrorPage({
  children,
  code,
  icon,
}: Readonly<{
  children: ReactNode
  code?: 500 | 400 | 404
  icon?: string
}>) {
  icon ??= code === 500 ? '❓' : code === 404 ? '🔍' : code === 400 ? '🔌' : '❌'
  return (
    <Container>
      {h1(icon)}
      <Separator />
      {children}
    </Container>
  )
}
