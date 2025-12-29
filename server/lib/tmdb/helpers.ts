// export async function getGenres() {
//   const [cacheErr, cached] = await unwrap(
//     cache.getOrSet<Record<number, string>>(CACHE_CONFIG.lib.tmdb.genres.key(), async () => {
//       const genres: Record<number, string> = {}
//       const [movieErr, movieGenres] = await unwrap(getMovieGenres())
//       const [tvErr, tvGenres] = await unwrap(getTvGenres())

//       if (movieErr) {
//         logger.error({ error: movieErr }, 'Error fetching movie genres:')
//       }

//       if (tvErr) {
//         logger.error({ error: tvErr }, 'Error fetching TV genres:')
//       }

//       movieGenres?.genres?.forEach((genre) => {
//         if (genre.id && genre.name) {
//           genres[genre.id] = genre.name
//         }
//       })

//       tvGenres?.genres?.forEach((genre) => {
//         if (genre.id && genre.name) {
//           genres[genre.id] = genre.name
//         }
//       })

//       return genres
//     }),
//   )

//   if (cacheErr) {
//     logger.error({ error: cacheErr }, 'Error fetching cached genres:')
//   }

//   return cached || {}
// }
