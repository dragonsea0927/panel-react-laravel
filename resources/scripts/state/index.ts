import progress, { ProgressStore } from '@/state/progress'
import settings, { SettingsStore } from '@/state/settings'
import user, { UserStore } from '@/state/user'
import { createStore, createTypedHooks } from 'easy-peasy'

export interface ApplicationStore {
  progress: ProgressStore
  user: UserStore
  settings: SettingsStore
}

const state: ApplicationStore = {
  progress,
  user,
  settings,
}

const typedHooks = createTypedHooks<ApplicationStore>()

export const useStoreActions = typedHooks.useStoreActions
export const useStoreDispatch = typedHooks.useStoreDispatch
export const useStoreState = typedHooks.useStoreState

export const store = createStore(state)
