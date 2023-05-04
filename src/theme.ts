import { defu } from 'defu'
import type { JSType, Schema } from 'untyped'

export type ConfigInputsTypes =
  | Exclude<JSType, 'symbol' | 'function' | 'any' | 'bigint'>
  | 'default' | 'icon' | 'file' | 'component' | 'design-token'

export type DesignTokensInputsTypes = 'color' | 'size' | 'shadow' | 'size' | 'opacity' | 'font' | 'font-weight' | 'font-size' | 'letter-spacing'

export type PickerTypes = 'media-picker' | 'icon-picker'

export type InputsTypes = DesignTokensInputsTypes | ConfigInputsTypes

export type PartialSchema = Pick<Schema, 'title' | 'description' | 'default' | 'required'> & { [key: string]: any }

const supportedFields: { [key in InputsTypes]: Schema } = {
  /**
   * Raw types
   */
  default: {
    type: 'string',
    tags: [
      '@studioInput string'
    ]
  },
  string: {
    type: 'string',
    tags: [
      '@studioInput string'
    ]
  },
  number: {
    type: 'number',
    tags: [
      '@studioInput number'
    ]
  },
  boolean: {
    type: 'boolean',
    tags: [
      '@studioInput boolean'
    ]
  },
  array: {
    type: 'array',
    tags: [
      '@studioInput array'
    ]
  },
  'design-token': {
    type: 'string',
    tags: [
      '@studioInput design-token'
    ]
  },
  object: {
    type: 'object',
    tags: [
      '@studioInput object',
      '@studioInputObjectValueType icon'
    ]
  },
  file: {
    type: 'string',
    tags: [
      '@studioInput file'
    ]
  },
  component: {
    type: 'string',
    tags: [
      '@studioInput component'
    ]
  },
  icon: {
    type: 'string',
    tags: [
      '@studioInput icon'
    ]
  },

  /**
   * Design Tokens
   */
  color: {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType color'
    ]
  },
  size: {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType size'
    ]
  },
  shadow: {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType shadow'
    ]
  },
  opacity: {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType opacity'
    ]
  },
  font: {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType font'
    ]
  },
  'font-weight': {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType font-weight'
    ]
  },
  'font-size': {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType size'
    ]
  },
  'letter-spacing': {
    type: 'string',
    tags: [
      '@studioInput design-token',
      '@studioInputTokenType size'
    ]
  }
}

export type StudioFieldData =
  PartialSchema &
  {
    type: keyof typeof supportedFields
    icon?: string
  }

/**
 * Declares a Nuxt Studio compatible configuration field.
 * Supports all type of fields provided by Nuxt Studio and all fields supported from Untyped Schema interface.
 */
export function field (
  type: keyof typeof supportedFields | StudioFieldData,
  defaultValue?: any
): Schema {
  // Custom `type` field should get overwritten by native Schema ones at this stage
  const result = defu(
    supportedFields[typeof type === 'string' ? type : type.type],
    type
  ) as StudioFieldData

  // Init tags
  if (!result.tags) { result.tags = [] }

  // Cast `icon` into its tag
  if (result.icon) {
    result.tags.push(`@studioIcon ${result.icon}`)
    delete result.icon
  }

  // Cast default value passed as 2nd parameter
  if (defaultValue) {
    result.default = defaultValue
  }

  return result as Schema
}
