import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import itemReducer from './itemSlice';

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    items: itemReducer,
  },
});

export default store;
