import { Anchor, Box, Container, Divider, Group, Paper, rem, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/legal/privacy')({
  component: PrivacyPolicy,
  head: () => ({
    meta: [{ title: 'Privacy Policy | Torkin' }, { name: 'description', content: 'Torkin privacy policy' }],
  }),
})

const SECTIONS = [
  { id: 'collect', title: 'Information We Collect' },
  { id: 'use', title: 'How We Use Your Information' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'sharing', title: 'Data Sharing' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'security', title: 'Data Security' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'rights', title: 'Your Rights' },
  { id: 'changes', title: 'Changes' },
  { id: 'contact', title: 'Contact' },
] as const

function PrivacyPolicy() {
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
            <ScrollArea h={rem(500)}>
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
                Privacy Policy
              </Title>
              <Text c="dimmed">Effective Date: January 2026</Text>
            </Box>

            <Divider />

            <Section id={SECTIONS[0].id} title="1. Information We Collect">
              <Stack gap="sm">
                <Text c="dimmed" lh={1.8}>
                  When you use Torkin, we collect information you provide to us:
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Discord user ID and username
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Server and channel IDs where Torkin is used
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Command usage data and interaction patterns
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Messages or content you send directly to the bot
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  And other information you provide to us as part of your interaction with the bot or services
                </Text>
              </Stack>
            </Section>

            <Section id={SECTIONS[1].id} title="2. How We Use Your Information">
              <Text c="dimmed" lh={1.8} mb="sm">
                We use your information to:
              </Text>
              <Stack gap="xs" ml="md">
                <Text c="dimmed" size="sm" lh={1.6}>
                  Provide movie and TV show discovery features
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Display watch provider information and availability
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Generate recommendations based on your preferences
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Analyze usage patterns to improve the bot
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Respond to your support requests
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Improve the bot's performance and features
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Comply with legal and regulatory requirements
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Protect the security and privacy of our users
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Support features or other functionality of the bot or services
                </Text>
              </Stack>
            </Section>

            <Section id={SECTIONS[2].id} title="3. Third-Party Services">
              <Text c="dimmed" lh={1.8} mb="sm">
                Torkin uses external services to provide functionality:
              </Text>
              <Stack gap="xs" ml="md">
                <Text c="dimmed" size="sm" lh={1.6}>
                  <Anchor href="https://www.themoviedb.org/" target="_blank">
                    TMDB
                  </Anchor>{' '}
                  - Movie and TV show data
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  <Anchor href="https://thetvdb.com/" target="_blank">
                    TVDB
                  </Anchor>{' '}
                  - Television series metadata
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  <Anchor href="https://discord.com/terms" target="_blank">
                    Discord
                  </Anchor>{' '}
                  - Bot interactions and API
                </Text>
              </Stack>
              <Text c="dimmed" lh={1.8} mt="sm">
                See{' '}
                <Anchor href="https://www.themoviedb.org/terms-of-use" target="_blank">
                  TMDB Terms
                </Anchor>{' '}
                and{' '}
                <Anchor href="https://thetvdb.com/tos" target="_blank">
                  TVDB Terms
                </Anchor>
                .
              </Text>
            </Section>

            <Section id={SECTIONS[3].id} title="4. Data Sharing">
              <Text c="dimmed" lh={1.8} mb="sm">
                We do not sell your personal information. We may disclose your information:
              </Text>
              <Stack gap="xs" ml="md">
                <Text c="dimmed" size="sm" lh={1.6}>
                  With service providers who assist in operating Torkin
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  To comply with legal obligations or valid legal requests
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  To protect the rights, privacy, safety, or property of Torkin, our users, or the public
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  In connection with a merger, acquisition, or sale of assets
                </Text>
              </Stack>
            </Section>

            <Section id={SECTIONS[4].id} title="5. Data Retention">
              <Text c="dimmed" lh={1.8}>
                We retain your information for as long as necessary to provide Torkin's services. Your data is stored
                until you request deletion or discontinue using the bot via deauthorizing the bot from your Discord
                account. You may request data deletion at any time via Discord.
              </Text>
            </Section>

            <Section id={SECTIONS[5].id} title="6. Data Security">
              <Text c="dimmed" lh={1.8}>
                We implement reasonable technical and organizational measures to protect your information from
                unauthorized access, alteration, disclosure, or destruction. These include encryption of sensitive data
                and access controls. However, no method of transmission or storage is 100% secure, and we cannot
                guarantee absolute data security.
              </Text>
            </Section>

            <Section id={SECTIONS[6].id} title="7. Cookies">
              <Text c="dimmed" lh={1.8}>
                We use cookies to keep you logged into our website. A cookie is a small piece of data that our website
                stores on your computer. This policy covers only cookies between your computer and our website, not
                third-party services.
              </Text>
            </Section>

            <Section id={SECTIONS[7].id} title="8. Children's Privacy">
              <Text c="dimmed" lh={1.8}>
                Torkin is not intended for users under 13, in accordance with Discord's Terms of Service. We do not
                knowingly collect information from children under 13. If you believe we have inadvertently collected
                information from a child under 13, contact us immediately via Discord.
              </Text>
            </Section>

            <Section id={SECTIONS[8].id} title="9. Your Rights">
              <Text c="dimmed" lh={1.8} mb="sm">
                Depending on your jurisdiction, you may have rights including:
              </Text>
              <Stack gap="xs" ml="md">
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to access your personal data
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to rectification of inaccurate data
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to erasure (right to be forgotten)
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to restrict or object to processing
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to data portability
                </Text>
                <Text c="dimmed" size="sm" lh={1.6}>
                  Right to lodge a complaint with a supervisory authority
                </Text>
              </Stack>
              <Text c="dimmed" lh={1.8} mt="sm">
                Contact us via{' '}
                <Anchor href="https://discord.gg/RP36fV6MNe" target="_blank">
                  Discord
                </Anchor>{' '}
                to exercise these rights.
              </Text>
            </Section>

            <Section id={SECTIONS[9].id} title="10. Changes">
              <Text c="dimmed" lh={1.8}>
                We may update this policy to reflect changes in our practices, technologies, or legal requirements. We
                will notify users of material changes through our Discord server. Continued use constitutes acceptance
                of the revised policy.
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
              Back to Torkin
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
