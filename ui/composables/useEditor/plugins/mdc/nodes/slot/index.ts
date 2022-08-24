import { createCmdKey, createCmd } from '@milkdown/core'
import { wrapIn } from '@milkdown/prose/commands'
import { kebabCase } from 'scule'
import type { ComponentSlotSchema } from '../../../../types'
import { createVueNode } from '../utils/prose'
import MarkdownSlot from './MarkdownSlot.vue'

export const TurnIntoSlot = createCmdKey<ComponentSlotSchema>()

export const componentSlotNodeId = 'componentSlot'
export const componentSlot = createVueNode({
  id: componentSlotNodeId,
  schema: () => ({
    group: 'block',
    content: 'block*',
    attrs: {
      name: {}
    },
    parseMarkdown: {
      match: ({ type }) => ['componentContainerSection'].includes(type),
      runner: (state, node, type) => {
        state.openNode(type, { name: node.name } as any)
        state.next(node.children)
        state.closeNode()
      }
    },
    toMarkdown: {
      match: ({ type }) => type.name === componentSlotNodeId,
      runner: (state, node) => {
        const { name } = node.attrs
        state.openNode('componentContainerSection', undefined, { name })
        state.next(node.content)
        state.closeNode()
      }
    }
  }),
  commands: type => [
    createCmd(TurnIntoSlot, (slot) => {
      return wrapIn(type, {
        name: kebabCase(slot!.name)
      })
    })
  ],
  view: MarkdownSlot
})
