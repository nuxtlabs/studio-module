import { defineTheme } from 'pinceau'
import { field } from '../src/utils'

export default defineTheme({
  color: {
    $schema: field('color'),
    black: '#000000'
  }
})
