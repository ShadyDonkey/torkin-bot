import { useQuery } from '@tanstack/react-query'
import type { APIApplicationEmoji } from 'discord-api-types/v10'
import { emoji, subtext } from 'discord-fmt'
import { useEffect, useState } from 'react'
import { getApplicationEmojis } from '../../../lib/discord/helpers'
import { getById } from '../../../lib/omdb/api'

export function Ratings({ voteAverage, imdbId }: Readonly<{ voteAverage: number; imdbId?: string }>) {
  const emojiQuery = useQuery({
    queryKey: ['application', 'emojis'],
    queryFn: () => getApplicationEmojis(),
  })

  const omdbQuery = useQuery({
    queryKey: ['omdb', imdbId],
    queryFn: () => {
      if (!imdbId) {
        return null
      }

      return getById(imdbId)
    },
  })

  const [emojis, setEmojis] = useState<{
    tmdb?: APIApplicationEmoji
    imdb?: APIApplicationEmoji
    rottenTomatoes?: APIApplicationEmoji
    metacritic?: APIApplicationEmoji
  }>({})

  const [text, setText] = useState('No Ratings Available')

  useEffect(() => {
    if (emojiQuery.data) {
      setEmojis({
        tmdb: emojiQuery.data.find((emoji) => emoji.name === 'TMDB'),
        imdb: emojiQuery.data.find((emoji) => emoji.name === 'IMDb'),
        rottenTomatoes: emojiQuery.data.find((emoji) => emoji.name === 'RottenTomatoes'),
        metacritic: emojiQuery.data.find((emoji) => emoji.name === 'Metacritic'),
      })
    }
  }, [emojiQuery.data])

  useEffect(() => {
    const ratings = []

    if (imdbId && omdbQuery.data?.Ratings) {
      for (const rating of omdbQuery.data.Ratings) {
        switch (rating.Source) {
          case 'Internet Movie Database':
            ratings.push(`${emojis.imdb ? emoji(emojis.imdb.name, emojis.imdb.id) : 'IMDb'} ${rating.Value}`)
            break
          case 'Rotten Tomatoes':
            ratings.push(
              `${emojis.rottenTomatoes ? emoji(emojis.rottenTomatoes.name, emojis.rottenTomatoes.id) : 'Rotten Tomatoes'} ${rating.Value}`,
            )
            break
          case 'Metacritic':
            ratings.push(
              `${emojis.metacritic ? emoji(emojis.metacritic.name, emojis.metacritic.id) : 'Metacritic'} ${rating.Value}`,
            )
            break
        }
      }
    }

    ratings.push(`${emojis.tmdb ? emoji(emojis.tmdb.name, emojis.tmdb.id) : 'TMDB'} ${voteAverage.toFixed(1)}/10`)

    setText(ratings.join('  |  '))
  }, [imdbId, voteAverage, emojis, omdbQuery.data])

  return subtext(text)
}
