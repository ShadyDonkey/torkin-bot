import type { APIBaseComponent, ComponentType } from 'discord-api-types/v10'
import { TextDisplay } from 'dressed'

type CarpNode = (APIBaseComponent<ComponentType> | string | undefined | false | 0 | null) | CarpNode[]

/**
 * **C**omponent **AR**ray **P**rocessor (a-la React)
 * - Filters falsy values
 * - Combines consecutive strings
 * - Turns strings into TextDisplays
 */
export default function carp<T extends APIBaseComponent<ComponentType>>(...components: CarpNode[]): T[] {
  const combined = (components.flat().filter(Boolean) as (T | string)[]).reduce<(T | string)[]>((acc, curr) => {
    const prev = acc.at(-1)
    if (typeof curr === 'string' && typeof prev === 'string') acc[acc.length - 1] = `${prev}\n${curr}`
    else acc.push(curr)
    return acc
  }, [])

  return combined.map((c) => (typeof c === 'object' ? c : TextDisplay(c))) as T[]
}
