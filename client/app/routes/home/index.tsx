import {
  Anchor,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Card,
  Container,
  Divider,
  Drawer,
  Group,
  Paper,
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

const REVIEWS = [
  {
    name: 'Alex M.',
    avatar: 'AM',
    rating: 5,
    quote: 'This bot saved me so much time. Finding where to watch movies is now instant.',
    color: '#e74c3c',
  },
  {
    name: 'Sarah K.',
    avatar: 'SK',
    rating: 5,
    quote: 'The tracking feature is a game changer. Never miss a new episode again.',
    color: '#9b59b6',
  },
  {
    name: 'Jordan T.',
    avatar: 'JT',
    rating: 5,
    quote: 'Clean, fast, and actually useful. My server loves using it every day.',
    color: '#3498db',
  },
  {
    name: 'Riley P.',
    avatar: 'RP',
    rating: 5,
    quote: 'The recommendations are surprisingly accurate. Found so many new shows!',
    color: '#2ecc71',
  },
]

function ReviewCard({ review }: Readonly<{ review: (typeof REVIEWS)[0] }>) {
  return (
    <Paper className="review-card" p="lg" radius="md">
      <Stack gap="sm">
        <Group gap="sm">
          <Avatar size="md" radius="xl" style={{ backgroundColor: review.color }}>
            <Text size="sm" fw={600} c="white">
              {review.avatar}
            </Text>
          </Avatar>
          <Text size="sm" fw={600}>
            {review.name}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" lh={1.6} style={{ fontStyle: 'italic' }}>
          "{review.quote}"
        </Text>
      </Stack>
    </Paper>
  )
}

export default function Home() {
  const [opened, { toggle, close }] = useDisclosure(false)
  return (
    <AppShell className="shell" header={{ height: 80 }}>
      <AppShell.Header className="header">
        <Box h="100%" px="xl">
          <Group h="100%" justify="space-between">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            <Anchor href="#" underline="never">
              <Box className="name">TORKIN</Box>
            </Anchor>

            <Group gap="xl" visibleFrom="sm">
              <Anchor href="#features" underline="never" c="dimmed" fw={500}>
                FEATURES
              </Anchor>
              <Anchor href="#reviews" underline="never" c="dimmed" fw={500}>
                REVIEWS
              </Anchor>
              <Anchor href="https://discord.gg/RP36fV6MNe" underline="never" c="dimmed" fw={500} target="_blank">
                SUPPORT
              </Anchor>
            </Group>

            <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
              <Button
                variant="filled"
                size="sm"
                radius="sm"
                fw={600}
                color="red"
                className="button-filled"
                style={{ letterSpacing: '0.05em' }}
              >
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
          <Anchor href="#reviews" c="dimmed" fw={500} onClick={close}>
            REVIEWS
          </Anchor>
          <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank" c="dimmed" fw={500} onClick={close}>
            SUPPORT
          </Anchor>
          <Divider />
          <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
            <Button variant="filled" fullWidth color="red" className="button-filled">
              ADD TO DISCORD
            </Button>
          </Anchor>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Box style={{ position: 'relative', overflow: 'hidden' }}>
          <Box className="hero-ambient" />
          <Container size="lg" py="xl" className="hero-content">
            <Stack gap="lg" align="center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Text size="xl" fw={600} style={{ letterSpacing: '0.3em' }}>
                  PRESENTING
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <Title
                  order={1}
                  ta="center"
                  className="gradient-text"
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

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.9, ease: 'circOut' }}
                style={{ marginTop: rem(32), marginBottom: rem(32), transformOrigin: 'center' }}
              >
                <Box
                  style={{
                    width: rem(80),
                    height: rem(2),
                    background: 'var(--marquee-red-solid)',
                    borderRadius: rem(2),
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                style={{ maxWidth: rem(600) }}
              >
                <Text
                  size="lg"
                  ta="center"
                  c="dimmed"
                  lh={1.6}
                  style={{
                    fontSize: 'clamp(1rem, 8vw, 1.4rem)',
                  }}
                >
                  A straight-forward Discord bot that makes it easy to find, discover, and track TV shows and movies.
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                <Group gap="md">
                  <Anchor href="https://discord.com/oauth2/authorize?client_id=1447864612577083514" target="_blank">
                    <Button
                      variant="filled"
                      size="lg"
                      radius="sm"
                      fw={600}
                      px="xl"
                      color="red"
                      className="button-filled"
                    >
                      GET STARTED
                    </Button>
                  </Anchor>
                  <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank">
                    <Button
                      variant="outline"
                      size="lg"
                      radius="sm"
                      fw={600}
                      px="xl"
                      color="red"
                      className="button-outline"
                    >
                      GET HELP
                    </Button>
                  </Anchor>
                </Group>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.5 }}>
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
              fontSize: rem(140),
              fontWeight: 700,
              color: 'var(--marquee-red)',
              fontFamily: 'inherit',
            }}
          >
            DISCOVER • TRACK • FIND • AVAILABILITY • DISCOVER • TRACK • FIND •
          </Box>
        </Box>

        <Box id="features" py={rem(120)}>
          <Container size="lg">
            <Stack gap="xl" align="center" mb={rem(60)}>
              <Title order={2} ta="center" size={rem(56)} className="gradient-text">
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
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                        }}
                      >
                        <feature.icon
                          size={rem(24)}
                          className="feature-icon"
                          style={{ color: 'var(--marquee-red-solid)' }}
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

        <Box id="reviews" py={rem(100)} style={{ background: 'var(--mantine-color-dark-8)' }}>
          <Container size="lg">
            <Stack gap="xl" align="center" mb={rem(60)}>
              <Title order={2} ta="center" size={rem(56)} className="gradient-text">
                WHAT PEOPLE SAY
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

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {REVIEWS.map((review, index) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ReviewCard review={review} />
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
                <Title order={3} mb="sm" style={{ color: 'var(--marquee-red-solid)' }}>
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
