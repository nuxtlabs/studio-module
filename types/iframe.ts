import { RouteLocationNormalized } from 'vue-router'

export interface IframePayloadUrlPush {
  type: 'push'
  url: string
  route: RouteLocationNormalized
}

export type IframePayload =
  | IframePayloadUrlPush
