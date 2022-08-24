import type { Node } from '@milkdown/prose/model'
import { AtomList } from '@milkdown/utils'

import { containerComponent, containerComponentNodeId, textComponent, textComponentNodeId } from './component'
import { componentSlot, componentSlotNodeId } from './slot'

export const isComponentNode = (node: Node) => [containerComponentNodeId, textComponentNodeId].includes(node.type.name)
export const isSlotNode = (node: Node) => node.type.name === componentSlotNodeId

export const isComponentOrSlotNode = (node: Node) => isComponentNode(node) || isSlotNode(node)

export default AtomList.create([
  containerComponent(),
  textComponent(),
  componentSlot()
])
