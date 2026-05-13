import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { challengesAPI } from '../../services/api'

export const fetchChallenges = createAsyncThunk('challenges/fetchAll', async (params) => {
  const res = await challengesAPI.list(params)
  return res.data
})

export const fetchChallenge = createAsyncThunk('challenges/fetchOne', async (slug) => {
  const res = await challengesAPI.get(slug)
  return res.data
})

export const submitSolution = createAsyncThunk('challenges/submit', async (data, { rejectWithValue }) => {
  try {
    const res = await challengesAPI.submit(data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Submission failed')
  }
})

const challengeSlice = createSlice({
  name: 'challenges',
  initialState: {
    list: [],
    current: null,
    submission: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSubmission: (state) => { state.submission = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallenges.pending, (state) => { state.loading = true })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchChallenges.rejected, (state) => { state.loading = false })
      .addCase(fetchChallenge.pending, (state) => { state.loading = true })
      .addCase(fetchChallenge.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchChallenge.rejected, (state) => { state.loading = false })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.submission = action.payload
      })
  },
})

export const { clearSubmission } = challengeSlice.actions
export default challengeSlice.reducer
