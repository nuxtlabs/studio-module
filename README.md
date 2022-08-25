# Nuxt Studio

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A new experience to build content-driven website with Nuxt.

- [✨ &nbsp;Release Notes](https://github.com/nuxtlabs/studio/releases)
- [▶️ Play online](https://nuxt.new/studio)
- [📖 &nbsp;Documentation](https://studio.nuxt.com)

## Features

- 👌&nbsp; Zero configuration to start *([see video](https://tailwindcss.nuxtjs.org/#quick-start))*
- 🪄&nbsp; Includes [CSS Nesting](https://drafts.csswg.org/css-nesting-1/) with [postcss-nesting](https://github.com/csstools/postcss-nesting)
- 🎨&nbsp; Discover your Tailwind Colors *([see video](https://tailwindcss.nuxtjs.org/#tailwind-colors))*
- ⚙️&nbsp; Reference your Tailwind config in your app
- 📦&nbsp; Extendable by [Nuxt modules](https://modules.nuxtjs.org/)
- 🚀&nbsp; [Nuxt 3](https://v3.nuxtjs.org) support

## Installation

```bash
yarn add --dev @nuxthq/studio
```

Then, register the module in your `nuxt.config.ts`:

```js
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    '@nuxthq/studio'
  ]
})
```

If you want latest updates, please use `@nuxthq/studio-edge` in your `package.json`:

```json
{
  "devDependencies": {
    "@nuxthq/studio": "npm:@nuxthq/studio-edge@latest"
  }
}
```

## Usage

The module will expose the Studio UI in development on `/_studio/`.

### Development

In this directory, after running `yarn install`:
- Run `yarn play` to start the playground, you can extends both [content-wind](https://github.com/Atinux/content-wind) or [docus](https://github.com/nuxt-themes/docus) so far.
- Copy `ui/.env.example` to `ui/.env` and ajust based on playground port',
- Run `yarn dev` on another terminal and open Studio url

To develop the Nuxt Studio UI in your project, install `@nuxthq/studio` on your project and run `nuxi dev` in your project instead of `yarn play`.


## License

- [ ] Define license

Copyright (c) NuxtLabs

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxthq/studio/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxthq/studio

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxthq/studio.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxthq/studio

[github-actions-ci-src]: https://github.com/nuxt-community/tailwindcss-module/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/nuxt-community/tailwindcss-module/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/github/@nuxthq/studio.svg
[codecov-href]: https://codecov.io/gh/@nuxthq/studio

[license-src]: https://img.shields.io/npm/l/@nuxthq/studio.svg
[license-href]: https://npmjs.com/package/@nuxthq/studio
