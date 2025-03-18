import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchIncome, addIncome, deleteIncome } from "../Api/incomeApi";

export const fetchIncomeAsync = createAsyncThunk(
  "income/fetchIncome",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchIncome();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addIncomeAsync = createAsyncThunk(
  "income/addIncome",
  async (incomeData, { rejectWithValue }) => {
    try {
      const response = await addIncome(incomeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeIncomeAsync = createAsyncThunk(
  "income/removeIncome",
  async (incomeId, { rejectWithValue }) => {
    try {
      await deleteIncome(incomeId);
      return incomeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const incomeSlice = createSlice({
  name: "income",
  initialState: {
    incomeItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncomeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeItems = action.payload;
      })
      .addCase(fetchIncomeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addIncomeAsync.fulfilled, (state, action) => {
        state.incomeItems.push(action.payload);
      })
      .addCase(removeIncomeAsync.fulfilled, (state, action) => {
        state.incomeItems = state.incomeItems.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export default incomeSlice.reducer;
