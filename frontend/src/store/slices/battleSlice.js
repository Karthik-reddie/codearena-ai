import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { battlesAPI } from '../../services/api'

export const fetchActiveBattles = createAsyncThunk('battles/fetchActive', async () => {
  const res = await battlesAPI.getActive()
  return res.data
})

export const createBattle = createAsyncThunk('battles/create', async (data) => {
  const res = await battlesAPI.create(data)
  return res.data
})

export const joinBattle = createAsyncThunk('battles/join', async (roomCode) => {
  const res = await battlesAPI.join(roomCode)
  return res.data
})

const battleSlice = createSlice({
  name: 'battles',
  initialState: {
    activeBattles: [],
    currentBattle: null,
    loading: false,
  },
  reducers: {
    setBattle: (state, action) => { state.currentBattle = action.payload },
    clearBattle: (state) => { state.currentBattle = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBattles.fulfilled, (state, action) => {
        state.activeBattles = action.payload
      })
      .addCase(createBattle.fulfilled, (state, action) => {
        state.currentBattle = action.payload
      })
      .addCase(joinBattle.fulfilled, (state, action) => {
        state.currentBattle = action.payload
      })
  },
})

export const { setBattle, clearBattle } = battleSlice.actions
export default battleSlice.reducer
