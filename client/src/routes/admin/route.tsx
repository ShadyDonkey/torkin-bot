import { AppShell, Box, Burger, Center, Container, Group, Loader, NavLink, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { authClient } from 'lib/auth'
import { Home } from 'lucide-react'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const LINKS = [
  {
    link: '/admin',
    label: 'Dashboard',
    icon: Home,
  },
]

function AdminLayout() {
  const { useSession } = authClient
  const session = useSession()
  const [opened, { toggle }] = useDisclosure()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const hasNotified = useRef(false)

  useEffect(() => {
    if (!session.isPending && (!session.data || session.data?.user.role !== 'admin')) {
      if (!hasNotified.current) {
        hasNotified.current = true
        notifications.show({
          title: 'Unauthorized',
          message: 'You do not have permission to access this page.',
          color: 'red',
        })
      }
      navigate({
        to: '/',
      })
    }
  }, [session.isPending, session.data, session.data?.user.role, navigate])

  if (session.isPending || session.data?.user.role !== 'admin') {
    return (
      <Container fluid h="99vh">
        <Center h="100%">
          <Loader color="blue" type="bars" />
        </Center>
      </Container>
    )
  }

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
