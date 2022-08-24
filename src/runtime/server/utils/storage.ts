import { useStorage } from '#imports'
import { prefixStorage } from 'unstorage'

export const contentSource = prefixStorage(useStorage(), 'content:source:content:')
