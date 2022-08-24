import { createNode } from '@milkdown/utils'
import type { DefineComponent } from 'vue'
import { renderVueCtx } from '../../../../utils/context'

export interface VueNodeSchema extends Omit<ReturnType<Parameters<typeof createNode>[0]>, 'view'> {
  view: DefineComponent<{}, {}, any>
}

export function createVueNode ({ id, schema, commands, view }: VueNodeSchema): ReturnType<typeof createNode> {
  return createNode(() => ({
    id,
    schema,
    commands,
    view: (ctx) => {
      const renderVue = ctx.get(renderVueCtx)
      const viewFactory = renderVue(view as Parameters<typeof renderVue>[0])(ctx)
      return (node, view, getPos, decorations, innerDecorations) => {
        const nodeView = viewFactory(node, view, getPos, decorations, innerDecorations)
        nodeView.update = (updatedNode) => {
          const skipUpdate = node.attrs.skipUpdate
          delete (node.attrs as any).skipUpdate
          return skipUpdate || node.sameMarkup(updatedNode)
        }
        nodeView.ignoreMutation = (mutation) => {
          // @ts-ignore
          return mutation.type !== 'selection' && (!nodeView.contentDOM || !nodeView.contentDOM.contains(mutation.target))
        }
        return nodeView
      }
    }
  }))
}
