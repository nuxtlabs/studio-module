import { $remark, AtomList } from '@milkdown/utils'
import remarkMDC from 'remark-mdc'

import nodes from './nodes'

import focus from './focus'
import selectAll from './select-all'

export default AtomList.create([
  $remark(() => remarkMDC),
  ...nodes,
  focus,
  selectAll
].flat())
