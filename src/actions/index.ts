import { getTrending, multiSearch } from '@/utils/tmdb'
import { deleteItemFromWatching, getWatching } from '@/utils/watching'
import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

export const server = {
  search: defineAction({
    input: z.object({ query: z.string().min(1) }),
    handler: async ({ query }) => {
      try {
        const data = await multiSearch(query)
        return data.results
      } catch (e) {
        return []
      }
    },
  }),
  recommended: defineAction({
    handler: async () => {
      try {
        const [trending, moreTrending] = await Promise.all([
          getTrending('all', { page: 1 }),
          getTrending('all', { page: 2 }),
        ])
        return [...trending.results, ...moreTrending.results]
      } catch (e) {
        return []
      }
    },
  }),
  deleteItemFromWatching: defineAction({
    input: z.object({ id: z.number().or(z.string()) }),
    handler: async ({ id }, context) => {
      try {
        await deleteItemFromWatching({
          headers: context.request.headers,
          id,
        })
        return true
      } catch (e) {
        return false
      }
    },
  }),
  trending: defineAction({
    input: z.object({ type: z.enum(['all', 'movie', 'tv']) }),
    handler: async ({ type }) => {
      try {
        const trending = await getTrending(type)
        return trending
      } catch (e) {
        return null
      }
    },
  }),
  watching: defineAction({
    handler: async (_, context) => {
      try {
        const watching = await getWatching({ headers: context.request.headers })
        return watching
      } catch (e) {
        return null
      }
    },
  }),
}
