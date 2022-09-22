import { chainCommands, createParagraphNear, newlineInCode, splitBlock } from '@milkdown/prose/commands'
import { keymap } from '@milkdown/prose/keymap'
import { $prose } from '@milkdown/utils'
import { isComponentOrSlotNode } from './mdc/nodes'
import { remove } from './mdc/nodes/utils/transactions'

export default $prose(() => keymap({
  Backspace: (state, dispatch, view) => {
    const { $from } = state.selection

    // Check if we're at the start of a line
    if ($from.parentOffset > 0) {
      return false
    }

    const parentNode = $from.node($from.depth - 1)

    // Check if we're at the start of a component/slot node
    if (!parentNode || parentNode.firstChild !== $from.parent || !isComponentOrSlotNode(parentNode)) {
      return false
    }

    // Dispatch remove transaction
    dispatch(
      remove({
        node: parentNode,
        view,
        getPos: () => $from.pos - (parentNode.nodeSize - parentNode.content.size)
      })
    )

    return true
  },
  Enter: (state, dispatch, view) => {
    const { $from } = state.selection

    // Check if we're in a empty component/slot node
    if ($from.parent.content.size > 0 || !isComponentOrSlotNode($from.node($from.depth - 1))) {
      return false
    }

    // Override "Enter" default keymap without `liftEmptyBlock` command (https://github.com/ProseMirror/prosemirror-commands/blob/97a8cb5fac25e697d4693ce343e2e3b020a7fa2f/src/commands.ts#L617)
    // `liftEmptyBlock` is responsible for lifting empty blocks, which we don't want at component/slot node level
    return chainCommands(newlineInCode, createParagraphNear, splitBlock)(state, dispatch, view)
  }
}))
