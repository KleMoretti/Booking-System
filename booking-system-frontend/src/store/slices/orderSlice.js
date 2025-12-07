// 订单状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as orderApi from '../../api/order'

// 异步操作：创建订单
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(orderData)
      if (response.code === 200) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：获取订单列表
export const getOrderList = createAsyncThunk(
  'order/getOrderList',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderList(params)
      if (response.code === 200) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：获取订单详情
export const getOrderDetail = createAsyncThunk(
  'order/getOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderDetail(orderId)
      if (response.code === 200) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：取消订单
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(orderId)
      if (response.code === 200) {
        return orderId
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 异步操作：支付订单
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await orderApi.payOrder(orderId, paymentMethod)
      if (response.code === 200) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  orderList: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderList: (state) => {
      state.orderList = []
    },
    clearError: (state) => {
      state.error = null
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // 创建订单
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取订单列表
      .addCase(getOrderList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOrderList.fulfilled, (state, action) => {
        state.loading = false
        state.orderList = action.payload.list || action.payload
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total
        }
      })
      .addCase(getOrderList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取订单详情
      .addCase(getOrderDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(getOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 取消订单
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false
        // 更新订单列表中的订单状态
        const index = state.orderList.findIndex(order => order.id === action.payload)
        if (index !== -1) {
          state.orderList[index].status = 2 // 已取消
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 支付订单
      .addCase(payOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearOrderList, clearError, setPagination } = orderSlice.actions
export default orderSlice.reducer
