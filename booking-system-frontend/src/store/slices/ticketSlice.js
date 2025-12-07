// 票务状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as ticketApi from '../../api/ticket'
import { API_CODE } from '../../utils/constants'

// 异步操作：搜索车次
export const searchTrips = createAsyncThunk(
  'ticket/searchTrips',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await ticketApi.searchTrips(searchParams)
      if (response.code === API_CODE.SUCCESS) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：获取车次详情
export const getTripDetail = createAsyncThunk(
  'ticket/getTripDetail',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getTripDetail(tripId)
      if (response.code === API_CODE.SUCCESS) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：获取可用座位
export const getAvailableSeats = createAsyncThunk(
  'ticket/getAvailableSeats',
  async ({ tripId, seatType }, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getAvailableSeats(tripId, seatType)
      if (response.code === API_CODE.SUCCESS) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  tripList: [],
  currentTrip: null,
  availableSeats: [],
  searchParams: null,
  loading: false,
  error: null,
}

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    clearTripList: (state) => {
      state.tripList = []
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 搜索车次
      .addCase(searchTrips.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchTrips.fulfilled, (state, action) => {
        state.loading = false
        state.tripList = action.payload
      })
      .addCase(searchTrips.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取车次详情
      .addCase(getTripDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTripDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentTrip = action.payload
      })
      .addCase(getTripDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取可用座位
      .addCase(getAvailableSeats.pending, (state) => {
        state.loading = true
      })
      .addCase(getAvailableSeats.fulfilled, (state, action) => {
        state.loading = false
        state.availableSeats = action.payload
      })
      .addCase(getAvailableSeats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearTripList, setSearchParams, clearError } = ticketSlice.actions
export default ticketSlice.reducer
