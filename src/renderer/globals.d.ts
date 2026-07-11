import type { RulerApi } from '../preload/index'

export {}

declare global {
  interface Window {
    rulerApi: RulerApi
  }
}
