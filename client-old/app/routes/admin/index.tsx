import type { Route } from './+types'

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Admin | Home' }]
}

export default function Index() {
  return <div>Admin Index</div>
}
