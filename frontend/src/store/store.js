import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./categorySlice";
import itemReducer from "./itemSlice";
import incomeReducer from "./incomeSlice";

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    items: itemReducer,
    income: incomeReducer,
  },
});

export default store;
