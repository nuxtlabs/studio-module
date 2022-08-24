# Nuxt Studio Module

Work at a faster pace with a beautiful interface and [real-time collaboration](https://studio.nuxt.com).

## Installation

```bash
yarn add --dev @nuxthq/studio
```

Then, register the module in your `nuxt.config.js`:

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
