// The only file your components import from.
//
// Swapping the simulated backend for your real API is one environment variable,
// set at BUILD time. Nothing in src/components or src/pages changes.
//
//   VITE_USE_MOCK_API=false  -> your Express API at VITE_API_BASE_URL
//   anything else, INCLUDING UNSET -> the browser-only fake
//
// Note which way round that is. Demo mode is the DEFAULT, so a fresh copy of
// this template builds into a working site before you have configured anything.
//
// Both modules are imported statically and one is chosen at run time. Bundling
// both costs a couple of kilobytes and keeps the demo build available as your
// fallback, which you want anyway.

import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

const implementation = USING_MOCK_API ? mockApi : httpApi

export const showsApi = implementation.showsApi
export const searchApi = implementation.searchApi
export const authApi = implementation.authApi
