import { prefixStorage } from 'unstorage'
import { useStorage } from '#imports'

export const contentSource = prefixStorage(useStorage(), 'content:source:content:')
