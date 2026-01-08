import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cache-manager')({
  component: CacheManager,
})

function CacheManager() {
  return <div>Hello "/admin/cache-manager"!</div>
}
