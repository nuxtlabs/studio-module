# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.3](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.3.2...v0.3.3) (2022-12-06)


### Features

* **app-config:** add support for `.studio` files ([#80](https://github.com/nuxtlabs/studio.nuxt.com/issues/80)) ([8804f40](https://github.com/nuxtlabs/studio.nuxt.com/commit/8804f40da086a704f91ba2bcaa018d62ce75bcf3))

### [0.3.2](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.3.1...v0.3.2) (2022-12-05)


### Features

* appConfig improvements ([#78](https://github.com/nuxtlabs/studio.nuxt.com/issues/78)) ([6e4a6da](https://github.com/nuxtlabs/studio.nuxt.com/commit/6e4a6da71e8109fedc9345ebf5129601fc76bd2a))

### [0.3.1](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.3.0...v0.3.1) (2022-11-29)


### Bug Fixes

* enable studio only in production ([#76](https://github.com/nuxtlabs/studio.nuxt.com/issues/76)) ([bc8234c](https://github.com/nuxtlabs/studio.nuxt.com/commit/bc8234c4bfef20e00488a7c23b1779c67a74bdcd))
* force nuxt-config-schema for now until part of core ([5805047](https://github.com/nuxtlabs/studio.nuxt.com/commit/58050476b1f95dee13ebb0624d9322de537adcfa))

## [0.3.0](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.7...v0.3.0) (2022-11-29)


### ⚠ BREAKING CHANGES

* expose app config (#74)

### Features

* expose app config ([#74](https://github.com/nuxtlabs/studio.nuxt.com/issues/74)) ([4d0d200](https://github.com/nuxtlabs/studio.nuxt.com/commit/4d0d20088eb3b47d7e05e1adc8fda61e0b60a3e4))

### [0.2.7](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.6...v0.2.7) (2022-11-25)


### Bug Fixes

* **components:** drop exposed field in meta ([#71](https://github.com/nuxtlabs/studio.nuxt.com/issues/71)) ([e2570fb](https://github.com/nuxtlabs/studio.nuxt.com/commit/e2570fbd71eba45b5cb460d685822f17cd918222))
* **preview:** prevent calling `refreshNuxtData` when preview mode is disabled ([#73](https://github.com/nuxtlabs/studio.nuxt.com/issues/73)) ([955e2a4](https://github.com/nuxtlabs/studio.nuxt.com/commit/955e2a409045a65b6392a559aaf9342390846ede))

### [0.2.6](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.5...v0.2.6) (2022-11-21)


### Features

* disable preview mode is query exists and its falsy ([#68](https://github.com/nuxtlabs/studio.nuxt.com/issues/68)) ([8611eea](https://github.com/nuxtlabs/studio.nuxt.com/commit/8611eeae70fc9873f74fa64b6ea5ce352b67467e))
* **preview:** send events through message to studio ([#65](https://github.com/nuxtlabs/studio.nuxt.com/issues/65)) ([4c7d8d1](https://github.com/nuxtlabs/studio.nuxt.com/commit/4c7d8d17404f506b503feda57f2bd0342a9e5d7a))


### Bug Fixes

* **preview:** change loading background in dark mode ([#64](https://github.com/nuxtlabs/studio.nuxt.com/issues/64)) ([6397d6b](https://github.com/nuxtlabs/studio.nuxt.com/commit/6397d6b3fd3bc7ba424120f5b7bb56e2831b9b9a))

### [0.2.5](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.4...v0.2.5) (2022-11-18)


### Bug Fixes

* **socket:** add auth token ([#67](https://github.com/nuxtlabs/studio.nuxt.com/issues/67)) ([9962ae5](https://github.com/nuxtlabs/studio.nuxt.com/commit/9962ae5dd4d57819472f9df5d74a6a316b64a7fb))

### [0.2.4](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.3...v0.2.4) (2022-11-18)


### Bug Fixes

* **preview:** send token from params for sync ([#66](https://github.com/nuxtlabs/studio.nuxt.com/issues/66)) ([c985aa3](https://github.com/nuxtlabs/studio.nuxt.com/commit/c985aa3fbc446b8c7ec62b0820fff6fe0e03459c))

### [0.2.3](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.2...v0.2.3) (2022-11-16)


### Features

* **preview:** loading overlay ([#63](https://github.com/nuxtlabs/studio.nuxt.com/issues/63)) ([084b5d7](https://github.com/nuxtlabs/studio.nuxt.com/commit/084b5d7d46f34f422ac72acf992dbaff973f4476))

### [0.2.2](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.1...v0.2.2) (2022-11-10)


### Bug Fixes

* missing useRuntimeConfig import ([dcf7d30](https://github.com/nuxtlabs/studio.nuxt.com/commit/dcf7d30b46f82063077890e375c536644758d6d4))

### [0.2.1](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.2.0...v0.2.1) (2022-11-10)


### Bug Fixes

* add missing import ([55364f5](https://github.com/nuxtlabs/studio.nuxt.com/commit/55364f5ef7aea2e4f4f2fdd03de89e8e416033ad))

## [0.2.0](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.5...v0.2.0) (2022-11-10)


### ⚠ BREAKING CHANGES

* Rename to /__studio and expose modules meta (#60)

### Features

* Rename to /__studio and expose modules meta ([#60](https://github.com/nuxtlabs/studio.nuxt.com/issues/60)) ([fbb3147](https://github.com/nuxtlabs/studio.nuxt.com/commit/fbb3147f76b6b60a9ed8ec99744014a511ca079d))

### [0.1.5](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.4...v0.1.5) (2022-11-09)


### Bug Fixes

* handle missing content in drafts ([#58](https://github.com/nuxtlabs/studio.nuxt.com/issues/58)) ([50f88d7](https://github.com/nuxtlabs/studio.nuxt.com/commit/50f88d7ebbfb1734cb5037e66e0d8419d3c10533))

### [0.1.4](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.3...v0.1.4) (2022-11-03)


### Features

* add /_studio_enabled.json route ([2e24f0a](https://github.com/nuxtlabs/studio.nuxt.com/commit/2e24f0acf766e05d19b0aaf7532383e5b51648ce)), closes [#56](https://github.com/nuxtlabs/studio.nuxt.com/issues/56)

### [0.1.3](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.2...v0.1.3) (2022-11-03)


### Features

* support STUDIO_API as env variable ([14a333a](https://github.com/nuxtlabs/studio.nuxt.com/commit/14a333a4327463225b6894503c366ecc6ccd2364))

### [0.1.2](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.1...v0.1.2) (2022-11-03)


### Bug Fixes

* lint ([8ddc1f4](https://github.com/nuxtlabs/studio.nuxt.com/commit/8ddc1f4d9accfad13ccd3d79283c7646137931c3))

### [0.1.1](https://github.com/nuxtlabs/studio.nuxt.com/compare/v0.1.0...v0.1.1) (2022-11-03)


### Bug Fixes

* add z-index and padding for preview bar ([aaa2b72](https://github.com/nuxtlabs/studio.nuxt.com/commit/aaa2b72c59d823bb6df7c7d8bb3755b055f5545b))
