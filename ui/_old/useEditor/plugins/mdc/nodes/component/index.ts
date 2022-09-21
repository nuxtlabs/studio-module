import { createCmdKey, createCmd, NodeSchema, Ctx } from '@milkdown/core'
import { wrapIn } from '@milkdown/prose/commands'
import { kebabCase } from 'scule'
import type { ComponentSchema } from '../../../../types'
import { componentSchemasCtx } from '../../../../utils/context'
import { createVueNode } from '../utils/prose'
import MarkdownComponent from './MarkdownComponent.vue'

export const TurnIntoComponent = createCmdKey<ComponentSchema>()

// Attributes that can be stored in nodes
const attrs = {
  name: {},
  props: {},
  propsInfo: {
    default: {
      inline: [],
      frontMatter: []
    }
  },
  schema: {
    default: undefined
  }
}

// Parsing
const parseMarkdown = (ctx: Ctx, id: string): NodeSchema['parseMarkdown'] => ({
  match: node => node.type === id,
  runner: (state, node, type) => {
    const name = node.data!.hName as string
    const props = node.data!.hProperties as Record<string, any>
    const propsInfo = {
      inline: Object.keys(node.attributes as object),
      frontMatter: Object.keys(node.fmAttributes as object)
    }
    const schema = ctx.get(componentSchemasCtx)!.find(schema => kebabCase(schema.name) === kebabCase(name))

    state.openNode(type, {
      name,
      props,
      propsInfo,
      schema
    } as any)
    state.next(node.children)
    state.closeNode()
  }
})

// Serialization
const serializeAttributes = ({ props, propsInfo: { frontMatter } }: Record<string, any>) => {
  const attributes = {}
  const fmAttributes = {}

  for (const key in props) {
    if (frontMatter.includes(key.startsWith(':') ? key.slice(1) : key)) {
      fmAttributes[key] = props[key]
    } else {
      attributes[key] = props[key]
    }
  }

  return {
    attributes,
    fmAttributes
  }
}

const toMarkdown = (id: string): NodeSchema['toMarkdown'] => ({
  match: node => node.type.name === id,
  runner: (state, node) => {
    state.openNode(id, undefined, {
      name: node.attrs.name,
      ...serializeAttributes(node.attrs)
    })
    node.content.size && state.next(node.content)
    state.closeNode()
  }
})

// Container components
export const containerComponentNodeId = 'containerComponent'
export const containerComponent = createVueNode({
  id: containerComponentNodeId,
  schema: ctx => ({
    group: 'block',
    content: 'block*',
    attrs,
    parseDOM: [{ tag: 'div ' }],
    toDOM: () => ['div'],
    parseMarkdown: parseMarkdown(ctx, 'containerComponent'),
    toMarkdown: toMarkdown('containerComponent')
  }),
  view: MarkdownComponent,
  commands: type => [
    createCmd(TurnIntoComponent, (schema) => {
      if (!schema) { return () => false }
      return wrapIn(type, {
        name: kebabCase(schema.name),
        props: {},
        schema
      })
    })
  ]
})

// Inline components
export const textComponentNodeId = 'textComponent'
export const textComponent = createVueNode({
  id: textComponentNodeId,
  schema: ctx => ({
    group: 'inline',
    content: 'inline*',
    inline: true,
    attrs,
    parseMarkdown: parseMarkdown(ctx, 'textComponent'),
    toMarkdown: toMarkdown('textComponent')
  }),
  view: MarkdownComponent
})
