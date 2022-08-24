export const avatar = {
  rounded: 'rounded',
  chip: {
    base: 'absolute block rounded-full ring-1 ring-white dark:ring-gray-900',
    variant: {
      gray: 'bg-gray-300 dark:bg-gray-500'
    }
  }
}

export const badge = {
  variant: {
    primary: 'bg-primary-500 text-white',
    gradient: 'bg-gradient-to-tr from-primary-500 to-pink-500 text-white'
  }
}

export const button = {
  variant: {
    white: 'shadow-sm border u-border-gray-300 u-text-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:bg-white dark:disabled:bg-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
    black: 'shadow-sm border border-transparent u-text-white u-bg-gray-800 hover:u-bg-gray-900 disabled:u-bg-gray-800 focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
    gray: 'shadow-sm border u-border-gray-300 u-text-gray-700 u-bg-gray-50 hover:u-bg-gray-100 disabled:u-bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
    'gray-light': 'shadow-sm border u-border-gray-300 u-text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 dark:bg-gray-800 dark:hover:bg-opacity-75 dark:disabled:bg-opacity-75 focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
    badge: 'border u-border-gray-300 u-text-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:bg-white dark:disabled:bg-gray-900',
    'badge-dashed': 'border border-dashed u-border-gray-300 u-text-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:bg-white dark:disabled:bg-gray-900',
    glass: 'shadow-sm border border-transparent u-text-gray-700 hover:u-text-black bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors duration-500'
  }
}

export const input = {
  appearance: {
    gray: 'u-bg-gray-50 u-text-gray-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 border u-border-gray-300 rounded-md shadow-sm',
    'gray-light': 'bg-gray-50 dark:bg-gray-800 u-text-gray-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 border u-border-gray-300 rounded-md shadow-sm'
  }
}

export const textarea = {
  ...input
}

export const select = {
  ...input
}

export const selectCustom = {
  ...input,
  list: {
    container: 'z-10 w-full py-2',
    base: 'bg-white dark:bg-gray-800 shadow-lg rounded-md ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none overflow-y-auto p-1 max-h-60',
    input: 'relative block w-full focus:ring-transparent text-sm px-2 py-1.5 u-text-gray-700 bg-white dark:bg-gray-800 border-0 focus:u-border-gray-200',
    option: {
      base: 'cursor-default select-none relative py-1.5 pl-2 pr-8 rounded-md text-sm',
      container: 'flex items-center gap-2',
      active: 'u-text-gray-900 bg-gray-100 dark:bg-gray-900',
      inactive: 'u-text-gray-900',
      empty: 'text-sm u-text-gray-400 px-2 py-1.5',
      icon: {
        base: 'absolute inset-y-0 right-0 flex items-center pr-2',
        active: '',
        inactive: '',
        size: 'h-4 w-4'
      }
    }
  }
}

export const dropdown = {
  base: 'bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg',
  item: {
    base: 'group flex items-center gap-2 px-3 py-1.5 text-sm w-full',
    active: 'bg-gray-100 dark:bg-gray-900 u-text-gray-900',
    icon: 'h-4 w-4 u-text-gray-400 group-hover:u-text-gray-500 flex-shrink-0'
  }
}

export const verticalNavigation = {
  inactive: 'u-text-gray-600 hover:u-text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50',
  badge: {
    base: 'ml-auto inline-block py-0.5 px-2 text-xs rounded-md'
  }
}

export const modal = {
  background: 'bg-white dark:bg-gray-900'
}

export const slideover = {
  background: 'bg-white dark:bg-gray-900'
}

export const card = {
  background: 'bg-gray-100 dark:bg-gray-800 hover:bg-opacity-75 focus:bg-opacity-75 dark:hover:bg-opacity-75 dark:focus:bg-opacity-75',
  shadow: '',
  ring: ''
}

export const toggle = {
  base: 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none focus:ring-transparent',
  active: 'bg-gray-100 dark:bg-gray-700',
  inactive: 'bg-gray-100 dark:bg-gray-700',
  container: {
    base: 'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-900 shadow transform ring-0 transition ease-in-out duration-200'
  },
  icon: {
    on: 'h-3 w-3 u-text-gray-500',
    off: 'h-3 w-3 u-text-gray-400'
  }
}
