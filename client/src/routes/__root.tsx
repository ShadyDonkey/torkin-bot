import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'
import mantineBaseStyles from '@mantine/core/styles.css?url'
import { Notifications } from '@mantine/notifications'
import mantineNotificationStyles from '@mantine/notifications/styles.css?url'
import { NavigationProgress } from '@mantine/nprogress'
import mantineNprogressStyles from '@mantine/nprogress/styles.css?url'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Torkin',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: mantineBaseStyles,
      },
      {
        rel: 'stylesheet',
        href: mantineNotificationStyles,
      },
      {
        rel: 'stylesheet',
        href: mantineNprogressStyles,
      },
    ],
  }),

  shellComponent: RootDocument,
})

const queryClient = new QueryClient()

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider defaultColorScheme="dark">
            <NavigationProgress />
            <Notifications />
            {children}
          </MantineProvider>
        </QueryClientProvider>

        <TanStackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
