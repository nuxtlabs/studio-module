import { trailingPlugin } from '@milkdown/plugin-trailing'
import { AtomList } from '@milkdown/utils'

export default AtomList.create([
  trailingPlugin({
    // Append trailing empty paragraph if the last element is not already an empty heading/paragraph
    shouldAppend: (node) => {
      if (!node) { return false }

      if (['heading', 'paragraph'].includes(node.type.name)) {
        return node.content.size > 0
      }

      return true
    }
  })
])
