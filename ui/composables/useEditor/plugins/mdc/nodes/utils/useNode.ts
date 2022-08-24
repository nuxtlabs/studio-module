import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { useNodeCtx } from '@milkdown/vue'
import { ref, watchEffect, unref } from 'vue'
import { focusedPos } from '../../focus'
import { duplicate as trDuplicate, remove as trRemove } from './transactions'

type Metadata = { node: Node, view: EditorView, getPos: () => number }

type SmartDispatcher = (
  transactionBuilder: (params: Metadata) => Transaction,
  opts?: { skipUpdate?: boolean }
) => void

export default function useNode () {
  const { view, getPos, ...ctx } = useNodeCtx<Node>()
  const node = unref(ctx.node)

  // Handle MDC Node focus
  const isFocused = ref(false)

  watchEffect(() => {
    isFocused.value = focusedPos.value === getPos()
  })

  // Smart dispatch with updated node
  const smartDispatch: SmartDispatcher = (transactionBuilder, { skipUpdate } = { skipUpdate: false }) => {
    // @ts-ignore
    node.attrs.skipUpdate = skipUpdate
    isFocused.value = false
    view.dispatch(
      transactionBuilder({
        node: view.state.doc.nodeAt(getPos())!,
        view,
        getPos
      })
    )
  }

  // Duplicate Markdown Component/Slot node
  const duplicate = () => smartDispatch(trDuplicate)

  // Remove Markdown Component/Slot node
  const remove = () => smartDispatch(trRemove)

  // Update node attributes (without trigerring re-render)
  const updateAttributes =
    (updater: (attrs: Record<string, any>) => Record<string, any>) => smartDispatch(({ node, view, getPos }) => {
      return view.state.tr.setNodeMarkup(getPos(), undefined, {
        ...node.attrs,
        ...updater({ props: { ...node.attrs.props } })
      })
    }, { skipUpdate: true })

  return {
    node,
    isFocused,
    duplicate,
    remove,
    updateAttributes
  }
}
