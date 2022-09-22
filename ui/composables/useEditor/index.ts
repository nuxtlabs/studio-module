import { Editor, rootCtx } from '@milkdown/core'
import { cursor } from '@milkdown/plugin-cursor'
import { emoji } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { tooltip } from '@milkdown/plugin-tooltip'
import { gfm } from '@milkdown/preset-gfm'
import { codeFence as cmCodeFence } from '@milkdown/preset-commonmark'
import { replaceAll, switchTheme } from '@milkdown/utils'
import { useEditor as useMilkdownEditor } from '@milkdown/vue'
import { computed, isRef, ref, unref, watch } from 'vue'

// Types
import type { Options } from './types'

// Internal context
import context, { setComponents } from './utils/context'

// Internal plugins
import block from './plugins/block'
import codeFence from './plugins/code-fence'
import collaborative, { joinRoom } from './plugins/collaborative'
import keymap from './plugins/keymap'
import mdc from './plugins/mdc'
import shiki from './plugins/shiki'
import slash from './plugins/slash'
import trailing from './plugins/trailing'

// Theme
import { dark, light } from './theme'

// Nuxt
import { useRuntimeConfig } from '#imports'

const useTheme = () => {
  // @ts-ignore
  const colorMode = typeof useColorMode === 'function' ? useColorMode() : ref('dark')
  const theme = computed(() => colorMode.value === 'dark' ? dark : light)
  return theme
}

export const useEditor = (options: Options) => {
  const theme = useTheme()
  const isCollabEnabled = Boolean(useRuntimeConfig().public.ywsUrl)

  const { editor, getInstance } = useMilkdownEditor((root, renderVue) => {
    const instance = Editor.make()
      .config(ctx => ctx.set(rootCtx, root))
      .use(context(options, renderVue))
      .use(unref(theme))
      .use(block)
      .use(cursor)
      .use(emoji)
      .use(gfm.replace(cmCodeFence, codeFence()))
      .use(history)
      .use(keymap)
      .use(listener)
      .use(mdc)
      .use(shiki)
      .use(slash)
      .use(tooltip)
      .use(trailing)

    if (isCollabEnabled) {
      instance.use(collaborative)
      instance.ctx.get(listenerCtx).mounted(() => {
        instance.action(joinRoom(options))
      })
    }

    return instance
  })

  // Reactive content
  if (isRef(options.content)) {
    watch(options.content, () => {
      getInstance()?.action(
        isCollabEnabled
          ? joinRoom(options)
          : replaceAll(unref(options.content)?.markdown ?? '')
      )
    })
  }

  // Reactive components
  if (isRef(options.components)) {
    watch(options.components, (components) => {
      getInstance()?.action(setComponents(components))
    })
  }

  // Reactive theme
  watch(theme, (value) => {
    getInstance()?.action(switchTheme(value))
  })

  return editor
}
