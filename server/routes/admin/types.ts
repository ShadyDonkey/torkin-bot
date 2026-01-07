import { t } from 'elysia'

export const InstallCommandSchema = t.Object({
  message: t.String(),
})

export type InstallCommandsType = typeof InstallCommandSchema.static
