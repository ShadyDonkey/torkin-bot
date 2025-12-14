import type {
  MessageComponentInteraction as OriginMessageComponentInteraction,
  ModalSubmitInteraction as OriginModalSubmitInteraction,
} from './node_modules/dressed/dist/types/interaction'

declare module 'dressed' {
  type MessageComponentInteraction<T extends 'Button' | keyof ResolvedSelectValues | undefined = undefined> =
    OriginMessageComponentInteraction<T> & { updateResponse: OriginMessageComponentInteraction<T>['update'] }
  type ModalSubmitInteraction = OriginModalSubmitInteraction & {
    updateResponse: OriginMessageComponentInteraction<T>['update']
  }
}
