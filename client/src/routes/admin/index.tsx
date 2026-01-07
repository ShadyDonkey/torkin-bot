import { Button, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { useApiMutation } from 'hooks/query'
import { getTreaty } from 'lib/api'
import { useState } from 'react'

export const Route = createFileRoute('/admin/')({
  component: Dashboard,
})

function Dashboard() {
  const [isInstalling, setIsInstalling] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)

  const installCommandsMutation = useApiMutation(() => getTreaty().admin.bot['install-commands'].post(), {
    successMessage: 'Batch update request sent successfully',
    onSettled: () => {
      setIsInstalling(false)
    },
  })

  return (
    <>
      <Button
        loading={isInstalling}
        onClick={() => {
          // setIsInstalling(true)
          // installCommandsMutation.mutate()
          open()
        }}
      >
        Install Commands
      </Button>

      <Modal opened={opened} onClose={close} title="Confirm Install Commands" centered>
        <Text>Are you sure you want to install commands?</Text>

        <Group mt="xl">
          <Button
            onClick={() => {
              installCommandsMutation.mutate()
              close()
            }}
          >
            Install
          </Button>
        </Group>
      </Modal>
    </>
  )
}
