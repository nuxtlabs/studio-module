export interface IframePayloadRouter {
  nuxtStudio: true,
  type: 'router',
  path: string
}

export type IframePayload =
  | IframePayloadRouter
