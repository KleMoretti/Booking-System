// 用户状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as userApi from '../../api/user'
import { setToken, setUserInfo, clearAuth } from '../../utils/auth'

// 异步操作：登录
export const login = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await userApi.login(credentials)
      if (response.code === 200) {
        setToken(response.data.token)
        setUserInfo(response.data.user)
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：注册
export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userApi.register(userData)
      if (response.code === 200) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：获取用户信息
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserProfile()
      if (response.code === 200) {
        setUserInfo(response.data)
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null
      state.isAuthenticated = false
      clearAuth()
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取用户信息
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
        state.isAuthenticated = true
      })
      .addCase(getUserProfile.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError } = userSlice.actions
export default userSlice.reducer
