import { Anchor, Box, Container, Divider, Group, Paper, rem, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import type { Route } from '../../+types/root'

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Terms of Service | Torkin' }, { name: 'description', content: 'Torkin terms of service' }]
}

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance' },
  { id: 'description', title: 'Description' },
  { id: 'usage', title: 'Usage Guidelines' },
  { id: 'prohibited', title: 'Prohibited Conduct' },
  { id: 'intellectual', title: 'Intellectual Property' },
  { id: 'disclaimer', title: 'Disclaimer' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes', title: 'Changes' },
  { id: 'governing', title: 'Governing Law' },
  { id: 'contact', title: 'Contact' },
] as const

export default function Terms() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -50% 0px' },
    )

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Container size="xl" py="xl">
      <Group align="flex-start" gap="xl" wrap="nowrap">
        <Box visibleFrom="md" style={{ width: rem(240), flexShrink: 0, position: 'sticky', top: rem(20) }}>
          <Paper p="md" radius="md" style={{ background: 'var(--mantine-color-dark-7)' }}>
            <Title order={5} mb="sm" style={{ color: 'var(--marquee-red-solid)' }}>
              Contents
            </Title>
            <ScrollArea h={rem(400)}>
              <Stack gap="xs">
                {SECTIONS.map((section, index) => (
                  <Anchor
                    key={section.id}
                    href={`#${section.id}`}
                    size="sm"
                    style={{
                      display: 'block',
                      padding: `${rem(4)} 0 ${rem(4)} ${rem(10)}`,
                      color: activeSection === section.id ? 'var(--marquee-red-solid)' : 'var(--mantine-color-dimmed)',
                      textDecoration: 'none',
                      fontWeight: activeSection === section.id ? 600 : 400,
                      transition: 'color 0.2s ease',
                      borderLeft:
                        activeSection === section.id ? `2px solid var(--marquee-red-solid)` : '2px solid transparent',
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {index + 1}. {section.title}
                  </Anchor>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Stack gap="lg">
            <Box>
              <Title order={1} size={rem(36)} mb="xs">
                Terms of Service
              </Title>
              <Text c="dimmed">Effective Date: January 2026</Text>
            </Box>

            <Divider />

            <Section id={SECTIONS[0].id} title="1. Acceptance">
              <Text c="dimmed" lh={1.8}>
                By using Torkin, our Discord bot, you agree to be bound by these terms of service, all applicable laws
                and regulations, and Discord's Terms of Service. If you do not agree with any of these terms, you should
                not use Torkin.
              </Text>
            </Section>

            <Section id={SECTIONS[1].id} title="2. Description">
              <Text c="dimmed" lh={1.8}>
                Torkin is a Discord bot that provides movie and TV show discovery features including watch availability
                information, recommendations, tracking, and more. The service is provided as-is and Shady Donkey
                reserves the right to modify, suspend, or discontinue any aspect of the service at any time.
              </Text>
            </Section>

            <Section id={SECTIONS[2].id} title="3. Usage Guidelines">
              <Text c="dimmed" lh={1.8} mb="sm">
                Torkin is free to use. When using Torkin, you agree to:
              </Text>
              <Stack gap="xs" ml="md">
                <Text c="dimmed" size="sm" lh={1.6}>
                  Use Torkin in accordance with Discord's Terms of Service and Community Guidelines
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Not use Torkin to spam, harass, or harm other users
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Not attempt to gain unauthorized access to any systems or networks
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Respect the intellectual property rights of content providers
                </Text>
              </Stack>
            </Section>

            <Section id={SECTIONS[3].id} title="4. Prohibited Conduct">
              <Text c="dimmed" lh={1.8}>
                You may not use Torkin to violate any applicable laws or regulations, impersonate any person or entity,
                interfere with or disrupt the service, use automated systems to spam the bot or other users, or
                facilitate illegal activities.
              </Text>
            </Section>

            <Section id={SECTIONS[4].id} title="5. Intellectual Property">
              <Text c="dimmed" lh={1.8} mb="sm">
                Torkin and its original content, features, and functionality are owned by Shady Donkey and are protected
                by international copyright, trademark, and other intellectual property laws.
              </Text>
              <Text c="dimmed" lh={1.8} mb="sm">
                Torkin sources movie and TV show data from third-party services. All content provided by these services
                remains the property of their respective owners.
              </Text>
              <Text c="dimmed" size="sm" lh={1.6} mb="xs" ml="md">
                Data is provided by:
              </Text>
              <Text c="dimmed" size="sm" lh={1.6} ml="md">
                -{' '}
                <Anchor href="https://www.themoviedb.org/" target="_blank">
                  TMDB
                </Anchor>{' '}
                (The Movie Database)
              </Text>
              <Text c="dimmed" size="sm" lh={1.6} ml="md">
                -{' '}
                <Anchor href="https://thetvdb.com/" target="_blank">
                  TVDB
                </Anchor>
              </Text>
              <Text c="dimmed" lh={1.8} mt="sm">
                See{' '}
                <Anchor href="https://www.themoviedb.org/terms-of-use" target="_blank">
                  TMDB Terms of Use
                </Anchor>{' '}
                and{' '}
                <Anchor href="https://thetvdb.com/tos" target="_blank">
                  TVDB Terms of Service
                </Anchor>
                . You agree to respect all applicable copyright and attribution requirements.
              </Text>
            </Section>

            <Section id={SECTIONS[5].id} title="6. Disclaimer">
              <Text c="dimmed" lh={1.8}>
                Torkin is provided on an as-is and as-available basis. Shady Donkey makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties including, without limitation, implied
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </Text>
              <Text c="dimmed" lh={1.8} mt="sm">
                Shady Donkey does not warrant that Torkin will be uninterrupted, timely, secure, or error-free, or that
                the information provided is accurate, complete, or current.
              </Text>
            </Section>

            <Section id={SECTIONS[6].id} title="7. Limitation of Liability">
              <Text c="dimmed" lh={1.8}>
                In no event shall Shady Donkey be liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from your access to or use of Torkin. Because some jurisdictions do not
                allow limitations on implied warranties, or limitations of liability for consequential or incidental
                damages, these limitations may not apply to you.
              </Text>
            </Section>

            <Section id={SECTIONS[7].id} title="8. Termination">
              <Text c="dimmed" lh={1.8}>
                You may stop using Torkin at any time by simply discontinuing use of the bot or removing it from your
                server. Shady Donkey reserves the right to terminate, suspend, or restrict your access to Torkin without
                notice for any reason, including violation of these Terms of Service or Discord's Terms of Service.
              </Text>
            </Section>

            <Section id={SECTIONS[8].id} title="9. Changes">
              <Text c="dimmed" lh={1.8}>
                Shady Donkey may revise these terms of service at any time without notice. Continued use of Torkin after
                any changes constitutes acceptance of the revised terms. We will notify users of material changes
                through our Discord server.
              </Text>
            </Section>

            <Section id={SECTIONS[9].id} title="10. Governing Law">
              <Text c="dimmed" lh={1.8}>
                These terms and conditions are governed by and construed in accordance with applicable laws. You
                irrevocably submit to the exclusive jurisdiction of the courts in your applicable state or location.
              </Text>
            </Section>

            <Section id={SECTIONS[10].id} title="11. Contact">
              <Text c="dimmed" lh={1.8}>
                Questions? Contact us via{' '}
                <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank">
                  our Discord server
                </Anchor>
                .
              </Text>
            </Section>

            <Divider />

            <Anchor href="/" size="sm" c="dimmed">
              ← Back to Torkin
            </Anchor>
          </Stack>
        </Box>
      </Group>
    </Container>
  )
}

function Section({ children, id, title }: Readonly<{ children: React.ReactNode; id: string; title: string }>) {
  return (
    <Box id={id} pt="md">
      <Title order={2} size="lg" mb="md" style={{ color: 'var(--marquee-red-solid)' }}>
        {title}
      </Title>
      {children}
    </Box>
  )
}
