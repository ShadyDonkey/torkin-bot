import type { CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from 'dressed'
import { createContext, type PropsWithChildren, useContext } from 'react'

export type InteractionContextType = MessageComponentInteraction | ModalSubmitInteraction | CommandInteraction | null

const InteractionContext = createContext<InteractionContextType>(null)

export function useInteraction() {
  const interaction = useContext(InteractionContext)

  if (!interaction) {
    throw new Error('useInteraction must be used within an InteractionProvider')
  }

  return interaction
}

export function InteractionProvider({
  children,
  interaction,
}: Readonly<PropsWithChildren<{ interaction: InteractionContextType }>>) {
  return <InteractionContext.Provider value={interaction}>{children}</InteractionContext.Provider>
}
