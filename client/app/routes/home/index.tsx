import {
  Anchor,
  AppShell,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { Bell, Compass, FileText, Globe, Headset, LogIn, LogOut, Tv, UserStar, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import type { Route } from '../../+types/root'
import './index.css'
import { authClient } from '../../../lib/auth'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Torkin | Your personal movie & TV show assistant in Discord' },
    {
      name: 'description',
      content: 'Your personal movie and TV show assistant in Discord',
    },
  ]
}

const FEATURES = [
  {
    icon: Tv,
    title: 'Where to Watch',
    description: 'Is it on Netflix? Hulu? Prime? Wonder no more.',
  },
  {
    icon: Compass,
    title: 'Similar & Related',
    description: 'Just finished Shutter Island? Find out what else is like it.',
  },
  {
    icon: Zap,
    title: 'Trending',
    description: 'See what people are talking about and watching right now.',
  },
  {
    icon: Bell,
    title: 'Track & Get Alerts',
    description: 'Track your favorite shows and movies and get alerts.',
  },
  {
    icon: FileText,
    title: 'In-depth details',
    description: 'Get in-depth details about your favorite shows and movies',
  },
  {
    icon: Globe,
    title: 'Multi-language support',
    description: 'If there are translations available, you can switch between them',
  },
]

export default function Home() {
  const { signIn, signOut } = authClient
  const { data: session } = authClient.useSession()

  // authClient.getSession().then((s) => { s.data.})
  return (
    <AppShell className="shell">
      <AppShell.Main>
        <Box style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Box className="hero-ambient" />
          <Container size="lg" py="xl" className="hero-content">
            <Stack gap="lg" align="center">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                <Image
                  style={{ width: '6rem', height: '6rem', rotate: '6deg' }}
                  src="https://cdn.discordapp.com/app-icons/1447864612577083514/942deffe7aad1e505a73d778d1ce26c1.png?size=256"
                />
                <Title order={1} ta="center" className="gradient-text" size={rem(48)}>
                  TORKIN
                </Title>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <Text size="lg" ta="center" lh={1.6} style={{ fontSize: 'clamp(1rem, 8vw, 1.4rem)', opacity: 0.8 }}>
                  A straight-forward bot to discover, read about, and track TV and movies.
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '0.5rem' }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Group gap="md">
                  <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
                    <Button variant="filled" size="lg" radius="sm" fw={600} color="dark" className="button-filled">
                      GET STARTED
                    </Button>
                  </Anchor>
                  <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank">
                    <Button variant="default" size="lg" radius="sm" color="dark">
                      <Headset />
                    </Button>
                  </Anchor>
                </Group>
              </motion.div>
            </Stack>
          </Container>
        </Box>

        <Box id="features" pb={rem(120)}>
          <Container size="lg">
            <Stack gap="xl" align="center" mb={rem(60)}>
              <Title order={2} ta="center" size={rem(32)} className="gradient-text">
                WHAT IT DOES
              </Title>
              <Box
                style={{
                  width: rem(128),
                  height: rem(4),
                  background: 'var(--marquee-red-solid)',
                  borderRadius: rem(2),
                }}
              />
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="feature-card"
                    padding="xl"
                    radius="md"
                    style={{
                      background: 'var(--mantine-color-dark-7)',
                      border: '1px solid var(--marquee-red)',
                    }}
                  >
                    <Stack gap="md">
                      <ThemeIcon
                        size={rem(48)}
                        radius="md"
                        variant="light"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                      >
                        <feature.icon
                          size={rem(24)}
                          className="feature-icon"
                          style={{ color: 'var(--mantine-color-dark-3)' }}
                        />
                      </ThemeIcon>
                      <Title order={3} size="xl">
                        {feature.title}
                      </Title>
                      <Text size="lg" c="dimmed" lh={1.5}>
                        {feature.description}
                      </Text>
                    </Stack>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box
          component="footer"
          py="xl"
          style={{
            background: 'var(--mantine-color-dark-9)',
            borderTop: '1px solid var(--marquee-red)',
          }}
        >
          <Container size="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
              <Box>
                <Title order={3} mb="xs">
                  TORKIN
                </Title>
                <Text c="dimmed" size="sm" mb="md">
                  Movie and TV assistant for Discord.
                </Text>
                {session ? (
                  <>
                    <Button
                      variant="subtle"
                      c="dimmed"
                      size="xs"
                      leftSection={<LogOut size={14} />}
                      onClick={() => signOut()}
                    >
                      Logout
                    </Button>

                    {session.user.role === 'admin' || (
                      <Button
                        component="a"
                        href="/admin"
                        variant="subtle"
                        c="dimmed"
                        size="xs"
                        leftSection={<UserStar size={14} />}
                      >
                        Admin Dashboard
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="subtle"
                    c="dimmed"
                    size="xs"
                    leftSection={<LogIn size={14} />}
                    onClick={() =>
                      signIn.social({
                        provider: 'discord',
                      })
                    }
                  >
                    Admin Login
                  </Button>
                )}
              </Box>

              <Box>
                <Title order={4} mb="sm">
                  SOCIAL
                </Title>
                <Stack gap="xs">
                  <Anchor href="https://discord.gg/RP36fV6MNe" c="dimmed" size="sm" target="_blank">
                    Discord / Support
                  </Anchor>
                  <Anchor href="https://github.com/ShadyDonkey" c="dimmed" size="sm" target="_blank">
                    GitHub
                  </Anchor>
                  <Anchor href="https://x.com/Shady_Donkey" c="dimmed" size="sm" target="_blank">
                    X
                  </Anchor>
                </Stack>
              </Box>

              <Box>
                <Title order={4} mb="sm">
                  LEGAL
                </Title>
                <Stack gap="xs">
                  <Anchor href="/legal/privacy" c="dimmed" size="sm">
                    Privacy Policy
                  </Anchor>
                  <Anchor href="/legal/terms" c="dimmed" size="sm">
                    Terms of Service
                  </Anchor>
                </Stack>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
