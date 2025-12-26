import type {
  MessageComponentInteraction as OriginMessageComponentInteraction,
  ModalSubmitInteraction as OriginModalSubmitInteraction,
} from './node_modules/@dressed/react/dist'

declare module '@dressed/react' {
  type MessageComponentInteraction<T extends 'Button' | keyof ResolvedSelectValues | undefined = undefined> =
    OriginMessageComponentInteraction<T> & { updateResponse: OriginMessageComponentInteraction<T>['update'] }
  type ModalSubmitInteraction = OriginModalSubmitInteraction & {
    updateResponse: OriginModalSubmitInteraction<T>['update']
  }
}
