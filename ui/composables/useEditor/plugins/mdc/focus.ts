import { findParentNode } from '@milkdown/prose'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'
import { isComponentOrSlotNode } from './nodes'

export const focusedPos = ref<number | null>(null)

export default $prose(() => new Plugin({
  key: new PluginKey('MDC_FOCUS'),
  view: (_view) => {
    return {
      update: ({ state }) => {
        const nodeWithPos = findParentNode(isComponentOrSlotNode)(state.selection)
        focusedPos.value = nodeWithPos && nodeWithPos.pos
      }
    }
  }
}))
