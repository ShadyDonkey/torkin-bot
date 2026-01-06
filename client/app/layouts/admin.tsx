import { AppShell, Burger, Button, Group, NavLink, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Home } from 'lucide-react'

import { Link, Outlet, useLocation } from 'react-router'

const LINKS = [
  {
    link: '/admin',
    label: 'Dashboard',
    icon: Home,
  },
]

export default function AdminLayout() {
  const [opened, { toggle }] = useDisclosure()
  const { pathname } = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="xl" fw={700}>
            Torkin Admin
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        {LINKS.map((link) => (
          <NavLink
            key={link.link}
            href={link.link}
            label={link.label}
            leftSection={<link.icon />}
            p="md"
            active={pathname === link.link}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
