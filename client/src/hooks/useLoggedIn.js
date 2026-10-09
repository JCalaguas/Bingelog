import { useSyncExternalStore } from 'react'
import { authApi } from '../api'

export default function useLoggedIn() {
  return useSyncExternalStore(authApi.subscribe, authApi.isLoggedIn)
}
