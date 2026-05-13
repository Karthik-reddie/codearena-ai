import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import challengeReducer from './slices/challengeSlice'
import battleReducer from './slices/battleSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenges: challengeReducer,
    battles: battleReducer,
    ui: uiReducer,
  },
})
