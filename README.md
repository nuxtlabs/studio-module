# Nuxt Studio

<!-- [![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href] -->

A new experience to build content-driven website with Nuxt.

- [✨ &nbsp;Release Notes](https://github.com/nuxtlabs/studio/releases)
- [▶️ Play online](https://nuxt.new/studio)
- [📖 &nbsp;Documentation](https://studio.nuxt.com)

## Features

- 👌&nbsp; Zero configuration to start, works with any [Nuxt 3](https://v3.nuxtjs.org) project
- 🪄&nbsp; Write your [Content](https://content.nuxt.org) with our Notion-like editor, powered by [Milkdown](https://milkdown.dev)
- 🎨&nbsp; Edit your [Design tokens](https://design-tokens.nuxtjs.org) with generated forms
- ⚙️&nbsp; Define your [project options](https://v3.nuxtjs.org/guide/features/app-config)
- 🚀&nbsp; Works both in development and production with live preview

## Installation

```bash
yarn add --dev @nuxthq/studio
```

Then, register the module in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: [
    '@nuxthq/studio'
  ]
})
```

## Configuration

By default the Studio API is `https://api.nuxt.studio`. If you want to customise it, you can set the `STUDIO_API` environement variable.

```bash
# .env
STUDIO_API=https://dev-api.nuxt.studio
```

## Usage

The module will expose the Studio UI in development on `/_studio/`.

### Development

In this directory:

- Run `yarn install`.
- Copy `ui/.env.example` to `ui/.env` and adjust based on playground port.
- When using VS Code, press `F5` to start the dev servers. Or to do it manually:
  - Run `yarn play` to start the playground, you can extends both [content-wind](https://github.com/Atinux/content-wind) or [docus](https://github.com/nuxt-themes/docus) so far.
  - Run `yarn ui` on another terminal.
- Visit http://localhost:3100/_studio to start.

To develop the Nuxt Studio UI in your project, install `@nuxthq/studio` on your project and run `nuxi dev` in your project instead of `yarn play`.

## License

- [ ] Define license

Copyright (c) NuxtLabs

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxthq/studio/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxthq/studio

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxthq/studio.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxthq/studio

[github-actions-ci-src]: https://github.com/nuxtlabs/studio/workflows/studio/badge.svg
[github-actions-ci-href]: https://github.com/nuxtlabs/studio/actions/workflows/studio.yml

[codecov-src]: https://img.shields.io/codecov/c/github/@nuxthq/studio.svg
[codecov-href]: https://codecov.io/gh/@nuxthq/studio

[license-src]: https://img.shields.io/npm/l/@nuxthq/studio.svg
[license-href]: https://npmjs.com/package/@nuxthq/studio
