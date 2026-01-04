import {
  Anchor,
  AppShell,
  Box,
  Burger,
  Button,
  Card,
  Container,
  Divider,
  Drawer,
  Group,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Bell, Compass, FileText, Globe, Tv, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import type { Route } from '../../+types/root'
import './index.css'

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
  const [opened, { toggle, close }] = useDisclosure(false)
  return (
    <AppShell className="shell" header={{ height: 80 }}>
      <AppShell.Header className="header">
        <Box h="100%" px="xl">
          <Group h="100%" justify="space-between">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            <Anchor href="#" underline="never">
              <Title order={1} className="name" style={{ color: 'var(--marquee-red-solid)' }}>
                TORKIN
              </Title>
            </Anchor>

            <Group gap="xl" visibleFrom="sm">
              <Anchor href="#features" underline="never" c="dimmed" fw={500}>
                FEATURES
              </Anchor>
              <Anchor href="https://discord.gg/RP36fV6MNe" underline="never" c="dimmed" fw={500} target="_blank">
                SUPPORT
              </Anchor>
            </Group>

            <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
              <Button variant="filled" size="sm" radius="sm" fw={600} color="red" style={{ letterSpacing: '0.05em' }}>
                ADD TO DISCORD
              </Button>
            </Anchor>
          </Group>
        </Box>
      </AppShell.Header>

      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title={<Title order={3}>TORKIN</Title>}
        hiddenFrom="sm"
        zIndex={200}
      >
        <Stack gap="md">
          <Anchor href="#features" c="dimmed" fw={500} onClick={close}>
            FEATURES
          </Anchor>
          <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank" c="dimmed" fw={500} onClick={close}>
            SUPPORT
          </Anchor>
          <Divider />
          <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
            <Button variant="filled" fullWidth color="red">
              ADD TO DISCORD
            </Button>
          </Anchor>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Box>
          <Container size="lg" py="xl">
            <Stack gap="lg" align="center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
                <Text size="xl" fw={600} style={{ letterSpacing: '0.3em' }}>
                  PRESENTING
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Title
                  order={1}
                  ta="center"
                  style={{
                    fontSize: 'clamp(2rem, 15vw, 4rem)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.02em',
                  }}
                >
                  YOUR PERSONAL
                  <br />
                  MOVIE & TV ASSISTANT
                </Title>
              </motion.div>

              <motion.div className="red-line" style={{ marginTop: rem(32), marginBottom: rem(32) }} />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.3 }}
                style={{ maxWidth: rem(600) }}
              >
                <Text
                  size="xl"
                  ta="center"
                  c="dimmed"
                  lh={1.6}
                  style={{
                    fontSize: 'clamp(1.2rem, 10vw, 1.75rem)',
                  }}
                >
                  A straight-forward Discord bot that makes it easy to find, discover, and track TV shows and movies.
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.8 }}
              >
                <Group gap="md">
                  <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
                    <Button variant="filled" size="lg" radius="sm" fw={600} px="xl" color="red">
                      GET STARTED
                    </Button>
                  </Anchor>
                  <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank">
                    <Button variant="outline" size="lg" radius="sm" fw={600} px="xl" color="red">
                      GET HELP
                    </Button>
                  </Anchor>
                </Group>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 3.2 }}>
                <Text size="xs" c="dimmed" style={{ letterSpacing: '0.2em', marginTop: rem(40) }}>
                  TOTALLY FREE • NO CREDIT CARD • NO BS • EASY TO USE
                </Text>
              </motion.div>
            </Stack>
          </Container>
        </Box>

        <Box py="xl" className="marquee-box">
          <Box
            className="marquee-content"
            style={{
              whiteSpace: 'nowrap',
              fontSize: rem(100),
              fontWeight: 700,
              color: 'rgba(220, 38, 38, 0.2)',
              fontFamily: 'inherit',
            }}
          >
            DISCOVER • TRACK • FIND • AVAILABILITY • DISCOVER • TRACK • FIND •
          </Box>
        </Box>

        <Box id="features" py={rem(120)}>
          <Container size="lg">
            <Stack gap="xl" align="center" mb={rem(60)}>
              <Title order={2} ta="center" size={rem(56)}>
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
                    padding="xl"
                    radius="md"
                    style={{
                      background: 'var(--mantine-color-dark-7)',
                      border: '1px solid var(--marquee-red)',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                  >
                    <Stack gap="md">
                      <ThemeIcon
                        size={rem(48)}
                        radius="md"
                        variant="light"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                        }}
                      >
                        <feature.icon size={rem(24)} style={{ color: 'var(--marquee-red-solid)' }} />
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
            background: 'var(--mantine-color-dark-8)',
            borderTop: '1px solid var(--marquee-red)',
          }}
        >
          <Container size="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
              <Box>
                <Title order={3} mb="sm">
                  TORKIN
                </Title>
                <Text c="dimmed" size="sm">
                  Movie and TV assistant for Discord.
                </Text>
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
                  <Anchor href="#" c="dimmed" size="sm">
                    Privacy Policy
                  </Anchor>
                  <Anchor href="#" c="dimmed" size="sm">
                    Terms of Service
                  </Anchor>
                </Stack>
              </Box>
            </SimpleGrid>

            <Divider my="lg" color="dark.4" />

            <Text ta="center" size="xs" c="dimmed" style={{ letterSpacing: '0.1em' }}>
              © 2025-{new Date().getFullYear()} SHADY DONKEY • ALL RIGHTS RESERVED
            </Text>
          </Container>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
