import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import ticketReducer from './slices/ticketSlice'
import orderReducer from './slices/orderSlice'

export default configureStore({
  reducer: {
    user: userReducer,
    ticket: ticketReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action types
        ignoredActions: ['ticket/searchTrips/fulfilled'],
      },
    }),
})

