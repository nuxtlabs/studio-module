import { createCmd, createCmdKey } from '@milkdown/core'
import { findParentNode } from '@milkdown/prose'
import { Node } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $command, $shortcut, AtomList } from '@milkdown/utils'
import { isComponentOrSlotNode } from './nodes'

const SelectAll = createCmdKey()

const command = $command(() => createCmd(SelectAll, () => {
  return (state, dispatch) => {
    if (!dispatch) { return false }

    const nodeWithPos = findParentNode(isComponentOrSlotNode)(state.selection)

    if (!nodeWithPos) { return false }

    const { node, pos } = nodeWithPos
    const { content } = node

    const contentNodes: Node[] = (content as any).content
    const lastContentNode = contentNodes[contentNodes.length - 1]

    const start = pos + (node.nodeSize - content.size)
    const end = start + content.size - (lastContentNode.nodeSize - lastContentNode.content.size)

    dispatch(state.tr.setSelection(TextSelection.create(state.doc, start, end)))

    return true
  }
}))

const shortcut = $shortcut(() => ({
  'Mod-a': () => command.run()
}))

export default AtomList.create([command, shortcut])
