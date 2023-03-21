import { defineTheme } from 'pinceau'
import { field } from '../src/theme'

export default defineTheme({
  color: {
    $schema: field('color'),
    black: '#000000'
  }
})
