import { Node } from '@milkdown/prose/model'
import { TextSelection, Transaction } from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view'

type Action = (params: { node: Node, view: EditorView, getPos: () => number }) => Transaction

export const duplicate: Action = ({ node, view, getPos }) => {
  const transaction = view.state.tr

  // Insert node copy after current node
  transaction.insert(getPos() + node.nodeSize, node.copy(node.content))

  // TODO: Move cursor in duplicated node ? (Could be tricky to know where depending on node content)

  return transaction
}

export const remove: Action = ({ node, view, getPos }) => {
  const transaction = view.state.tr
  const nodePos = getPos()

  // Replace node by a paragraph
  transaction.replaceRangeWith(nodePos, nodePos + node.content.size, view.state.schema.nodes.paragraph.create())

  // Move cursor to start of paragraph
  transaction.setSelection(TextSelection.create(transaction.doc, nodePos + 1))

  return transaction
}
