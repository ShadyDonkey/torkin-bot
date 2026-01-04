import type { Route } from '../../+types/root'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Torkin | Your personal movie & TV show assistant in Discord' },
    {
      name: 'description',
      content: 'Your personal movie and TV show assistant in Discord',
    },
  ]
}

export default function Home() {
  return <></>
}
